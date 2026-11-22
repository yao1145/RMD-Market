/**
 * A small, deterministic interpreter for the Cattca interactive-fiction
 * language. It is inspired by CattcaJS but deliberately does not embed or
 * evaluate JavaScript: expressions are parsed by the recursive-descent
 * evaluator below and only expose a whitelisted `Math` namespace.
 */

export type CattcaValue = string | number | boolean | null;

export interface CattcaChoice {
  readonly index: number;
  readonly label: string;
}

export type CattcaPending =
  | {
      readonly kind: 'choice';
      readonly instruction: number;
      readonly variable: string | null;
      readonly options: readonly CattcaChoice[];
    }
  | {
      readonly kind: 'text';
      readonly instruction: number;
      readonly variable: string;
    };

export interface CattcaOutputEntry {
  readonly id: number;
  readonly kind: 'text' | 'value';
  readonly text: string;
}

export interface CattcaState {
  readonly variables: Readonly<Record<string, CattcaValue>>;
  readonly output: readonly CattcaOutputEntry[];
  readonly logs: readonly string[];
  readonly pending: CattcaPending | null;
  readonly finished: boolean;
  readonly error: string | null;
}

export interface CattcaProgram {
  readonly instructions: readonly CattcaInstruction[];
  readonly labels: ReadonlyMap<string, number>;
  readonly error: string | null;
}

export const CATTCA_LIMITS = Object.freeze({
  scriptLength: 100_000,
  instructions: 5_000,
  variables: 1_000,
  outputEntries: 10_000,
  outputChars: 500_000,
  logEntries: 2_000,
  stepsPerResume: 20_000,
  expressionLength: 2_000,
  expressionDepth: 32,
  commandDepth: 16,
  choiceOptions: 64,
  nameLength: 128,
  inputLength: 2_000,
});

/* ------------------------------------------------------------ instructions */

export type CattcaCommand =
  | { readonly kind: 'let'; readonly name: string; readonly expression: string | null }
  | { readonly kind: 'set'; readonly name: string; readonly expression: string }
  | { readonly kind: 'apply'; readonly expression: string }
  | { readonly kind: 'log'; readonly expression: string }
  | { readonly kind: 'label'; readonly name: string }
  | { readonly kind: 'goto'; readonly name: string }
  | { readonly kind: 'if'; readonly condition: string; readonly then: CattcaCommand }
  | {
      readonly kind: 'inputCase';
      readonly variable: string | null;
      readonly options: readonly { readonly label: string; readonly command: CattcaCommand }[];
    }
  | { readonly kind: 'inputText'; readonly name: string }
  | { readonly kind: 'exit' }
  | { readonly kind: 'unknown'; readonly raw: string };

export type CattcaInstruction =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'command'; readonly command: CattcaCommand };

/* ------------------------------------------------------------------ helpers */

const IDENTIFIER_START = /^[\p{L}_$]$/u;
const IDENTIFIER_PART = /^[\p{L}\p{N}_$]$/u;
const NUMBER_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function hasOwn(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isIdentifier(value: string): boolean {
  if (value.length === 0 || value.length > CATTCA_LIMITS.nameLength) return false;
  const chars = Array.from(value);
  if (!IDENTIFIER_START.test(chars[0])) return false;
  for (let index = 1; index < chars.length; index += 1) {
    if (!IDENTIFIER_PART.test(chars[index])) return false;
  }
  return true;
}

function decodeEscapes(value: string): string {
  let result = '';
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== '\\') {
      result += char;
      continue;
    }
    const next = value[index + 1];
    if (next === undefined) {
      result += '\\';
      break;
    }
    index += 1;
    switch (next) {
      case 'n':
        result += '\n';
        break;
      case 'r':
        result += '\r';
        break;
      case 't':
        result += '\t';
        break;
      case '\\':
        result += '\\';
        break;
      case "'":
        result += "'";
        break;
      case '"':
        result += '"';
        break;
      default:
        result += next;
        break;
    }
  }
  return result;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if (trimmed.length >= 2 && (first === "'" || first === '"') && last === first) {
    return decodeEscapes(trimmed.slice(1, -1));
  }
  return trimmed;
}

function readVariableName(value: string): string {
  const name = unquote(value);
  if (!isIdentifier(name)) throw new Error(`无效的变量名：${name || '(空)'}`);
  return name;
}

function readLabelName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('缺少标签名');
  if (trimmed[0] === "'" || trimmed[0] === '"') {
    const label = unquote(trimmed);
    if (!label) throw new Error('标签名不能为空');
    return label;
  }
  if (!isIdentifier(trimmed)) throw new Error(`无效的标签名：${trimmed}`);
  return trimmed;
}

function splitTopLevel(source: string, separator: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let quote: string | null = null;
  let escaped = false;
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') {
      depth += 1;
      continue;
    }
    if (char === ')' || char === ']' || char === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0 && source.startsWith(separator, index)) {
      parts.push(source.slice(start, index));
      index += separator.length - 1;
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}

function findTopLevel(source: string, separator: string): number {
  let quote: string | null = null;
  let escaped = false;
  let depth = 0;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') {
      depth += 1;
      continue;
    }
    if (char === ')' || char === ']' || char === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0 && source.startsWith(separator, index)) return index;
  }
  return -1;
}

function findCommandClose(source: string, start: number): number {
  let quote: string | null = null;
  let escaped = false;
  for (let index = start; index < source.length - 1; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === '/' && source[index + 1] === '>') return index;
  }
  return -1;
}

/* -------------------------------------------------------------- compilation */

function parseInputCase(rest: string): CattcaCommand {
  const trimmed = rest.trim();
  if (!trimmed) throw new Error('input case 缺少选项');

  let variable: string | null = null;
  let optionSource = trimmed;
  if (trimmed.startsWith(':')) {
    optionSource = trimmed.slice(1);
  } else {
    const colon = findTopLevel(trimmed, ':');
    if (colon < 0) throw new Error('input case 缺少选项冒号');
    const name = trimmed.slice(0, colon).trim();
    if (name) variable = readVariableName(name);
    optionSource = trimmed.slice(colon + 1);
  }

  const options: { label: string; command: CattcaCommand }[] = [];
  for (const part of splitTopLevel(optionSource, ':')) {
    const option = part.trim();
    if (!option) continue;
    const arrow = findTopLevel(option, '->');
    if (arrow < 0) throw new Error(`input case 选项缺少 ->：${option}`);
    const label = unquote(option.slice(0, arrow));
    if (!label) throw new Error('input case 选项文本不能为空');
    const commandSource = option.slice(arrow + 2).trim();
    if (!commandSource) throw new Error(`input case 选项缺少命令：${label}`);
    const command = parseCommand(commandSource);
    if (!command) throw new Error(`input case 选项缺少命令：${label}`);
    options.push({ label, command });
  }
  if (options.length === 0) throw new Error('input case 至少需要一个选项');
  if (options.length > CATTCA_LIMITS.choiceOptions) {
    throw new Error(`input case 选项过多（最多 ${CATTCA_LIMITS.choiceOptions} 个）`);
  }
  return { kind: 'inputCase', variable, options };
}

function parseCommand(raw: string): CattcaCommand | null {
  const text = raw.trim();
  if (!text) return null;

  if (text === 'exit') return { kind: 'exit' };

  if (text === 'let' || /^let\s/u.test(text)) {
    const rest = text.slice(3).trim();
    if (!rest) throw new Error('let 缺少变量名');
    const equals = findTopLevel(rest, '=');
    if (equals < 0) {
      return { kind: 'let', name: readVariableName(rest), expression: null };
    }
    return {
      kind: 'let',
      name: readVariableName(rest.slice(0, equals)),
      expression: rest.slice(equals + 1).trim(),
    };
  }

  if (text === 'set' || /^set\s/u.test(text)) {
    const rest = text.slice(3).trim();
    const equals = findTopLevel(rest, '=');
    if (equals < 0) throw new Error('set 缺少 = 和表达式');
    return {
      kind: 'set',
      name: readVariableName(rest.slice(0, equals)),
      expression: rest.slice(equals + 1).trim(),
    };
  }

  if (text === 'apply' || /^apply\s/u.test(text)) {
    return { kind: 'apply', expression: text.slice(5).trim() };
  }

  if (text === 'log' || /^log\s/u.test(text)) {
    return { kind: 'log', expression: text.slice(3).trim() };
  }

  if (text === 'label' || /^label\s/u.test(text)) {
    return { kind: 'label', name: readLabelName(text.slice(5)) };
  }

  if (text === 'goto' || /^goto\s/u.test(text)) {
    return { kind: 'goto', name: readLabelName(text.slice(4)) };
  }

  if (text === 'if' || /^if\s/u.test(text)) {
    const rest = text.slice(2).trim();
    const arrow = findTopLevel(rest, '->');
    if (arrow < 0) throw new Error('if 缺少 ->');
    const condition = rest.slice(0, arrow).trim();
    if (!condition) throw new Error('if 缺少条件');
    const thenSource = rest.slice(arrow + 2).trim();
    const then = parseCommand(thenSource);
    if (!then) throw new Error('if 缺少 -> 后的命令');
    return { kind: 'if', condition, then };
  }

  const inputText = /^input\s+text(?=\s|$)/u.exec(text);
  if (inputText) {
    const name = text.slice(inputText[0].length).trim();
    if (!name) throw new Error('input text 缺少变量名');
    return { kind: 'inputText', name: readVariableName(name) };
  }

  const inputCase = /^input\s+case(?=\s|:|$)/u.exec(text);
  if (inputCase) {
    return parseInputCase(text.slice(inputCase[0].length));
  }

  return { kind: 'unknown', raw: text };
}

export function compileCattca(source: string): CattcaProgram {
  try {
    if (source.length > CATTCA_LIMITS.scriptLength) {
      throw new Error(`剧本过长（最多 ${CATTCA_LIMITS.scriptLength} 个字符）`);
    }
    const normalized = source.replace(/\r\n?/g, '\n');
    const instructions: CattcaInstruction[] = [];
    const labels = new Map<string, number>();

    const pushText = (text: string): void => {
      if (!text.trim()) return;
      instructions.push({ type: 'text', text });
      if (instructions.length > CATTCA_LIMITS.instructions) {
        throw new Error(`指令过多（最多 ${CATTCA_LIMITS.instructions} 条）`);
      }
    };

    let cursor = 0;
    while (cursor < normalized.length) {
      const open = normalized.indexOf('</', cursor);
      if (open < 0) {
        pushText(normalized.slice(cursor));
        break;
      }
      pushText(normalized.slice(cursor, open));
      const close = findCommandClose(normalized, open + 2);
      if (close < 0) throw new Error('命令块缺少结束定界符 />');
      const block = normalized.slice(open + 2, close);
      for (const raw of splitTopLevel(block, ';')) {
        const command = parseCommand(raw);
        if (!command) continue;
        if (command.kind === 'label') {
          labels.set(command.name, instructions.length);
          continue;
        }
        instructions.push({ type: 'command', command });
        if (instructions.length > CATTCA_LIMITS.instructions) {
          throw new Error(`指令过多（最多 ${CATTCA_LIMITS.instructions} 条）`);
        }
      }
      cursor = close + 2;
      if (normalized[cursor] === '\n') cursor += 1;
    }

    return { instructions, labels, error: null };
  } catch (error) {
    return { instructions: [], labels: new Map(), error: errorMessage(error) };
  }
}

/* ------------------------------------------------------------ expressions */

interface ExpressionToken {
  readonly type: 'number' | 'string' | 'identifier' | 'operator' | 'punctuation' | 'eof';
  readonly value: string;
}

type ExpressionNode =
  | { readonly kind: 'literal'; readonly value: CattcaValue }
  | { readonly kind: 'variable'; readonly name: string }
  | { readonly kind: 'unary'; readonly op: '!' | '+' | '-'; readonly argument: ExpressionNode }
  | {
      readonly kind: 'binary';
      readonly op: string;
      readonly left: ExpressionNode;
      readonly right: ExpressionNode;
    }
  | {
      readonly kind: 'conditional';
      readonly test: ExpressionNode;
      readonly consequent: ExpressionNode;
      readonly alternate: ExpressionNode;
    }
  | { readonly kind: 'member'; readonly object: ExpressionNode; readonly property: string }
  | { readonly kind: 'call'; readonly callee: ExpressionNode; readonly args: readonly ExpressionNode[] };

const MATH_NAMESPACE = Object.freeze({ kind: 'math-namespace' as const });
type MathFunction = { readonly kind: 'math-function'; readonly name: string };
type EvalValue = CattcaValue | typeof MATH_NAMESPACE | MathFunction;

const MATH_CONSTANTS: Readonly<Record<string, number>> = Object.freeze({
  E: Math.E,
  PI: Math.PI,
});

const MATH_FUNCTIONS: Readonly<Record<string, (...args: number[]) => number>> = Object.freeze({
  abs: (value) => Math.abs(value),
  ceil: (value) => Math.ceil(value),
  floor: (value) => Math.floor(value),
  max: (...values) => Math.max(...values),
  min: (...values) => Math.min(...values),
  pow: (base, exponent) => Math.pow(base, exponent),
  round: (value) => Math.round(value),
  sign: (value) => Math.sign(value),
  sqrt: (value) => Math.sqrt(value),
  trunc: (value) => Math.trunc(value),
});

function tokenizeExpression(source: string): ExpressionToken[] {
  const tokens: ExpressionToken[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index];
    if (/\s/u.test(char)) {
      index += 1;
      continue;
    }
    if (char === "'" || char === '"') {
      const quote = char;
      let value = '';
      index += 1;
      let closed = false;
      while (index < source.length) {
        const current = source[index];
        if (current === '\\') {
          value += current;
          index += 1;
          if (index >= source.length) break;
          value += source[index];
          index += 1;
          continue;
        }
        if (current === quote) {
          index += 1;
          closed = true;
          break;
        }
        value += current;
        index += 1;
      }
      if (!closed) throw new Error('字符串缺少结束引号');
      tokens.push({ type: 'string', value: decodeEscapes(value) });
      continue;
    }
    const number = NUMBER_PATTERN.exec(source.slice(index));
    if (number && number[0].length > 0) {
      tokens.push({ type: 'number', value: number[0] });
      index += number[0].length;
      continue;
    }
    if (IDENTIFIER_START.test(char)) {
      let end = index + 1;
      while (end < source.length && IDENTIFIER_PART.test(source[end])) end += 1;
      tokens.push({ type: 'identifier', value: source.slice(index, end) });
      index = end;
      continue;
    }
    const three = source.slice(index, index + 3);
    if (three === '===' || three === '!==') {
      tokens.push({ type: 'operator', value: three });
      index += 3;
      continue;
    }
    const two = source.slice(index, index + 2);
    if (
      two === '==' ||
      two === '!=' ||
      two === '<=' ||
      two === '>=' ||
      two === '&&' ||
      two === '||'
    ) {
      tokens.push({ type: 'operator', value: two });
      index += 2;
      continue;
    }
    if ('+-*/%!<>'.includes(char)) {
      tokens.push({ type: 'operator', value: char });
      index += 1;
      continue;
    }
    if ('?:(),.'.includes(char)) {
      tokens.push({ type: 'punctuation', value: char });
      index += 1;
      continue;
    }
    throw new Error(`无法识别的表达式字符：${char}`);
  }
  tokens.push({ type: 'eof', value: '' });
  return tokens;
}

class ExpressionParser {
  private index = 0;

  constructor(private readonly tokens: readonly ExpressionToken[]) {}

  parse(): ExpressionNode {
    const node = this.parseConditional();
    if (this.peek().type !== 'eof') {
      throw new Error(`表达式中存在多余内容：${this.peek().value}`);
    }
    return node;
  }

  private peek(): ExpressionToken {
    return this.tokens[this.index] ?? { type: 'eof', value: '' };
  }

  private advance(): ExpressionToken {
    const token = this.peek();
    this.index += 1;
    return token;
  }

  private match(value: string): boolean {
    if (this.peek().value !== value) return false;
    this.index += 1;
    return true;
  }

  private expect(value: string): void {
    if (!this.match(value)) {
      throw new Error(`表达式缺少 ${value}，遇到 ${this.peek().value || '结尾'}`);
    }
  }

  private expectIdentifier(): string {
    const token = this.advance();
    if (token.type !== 'identifier') throw new Error(`表达式缺少标识符，遇到 ${token.value || '结尾'}`);
    return token.value;
  }

  private parseConditional(): ExpressionNode {
    const test = this.parseLogicalOr();
    if (!this.match('?')) return test;
    const consequent = this.parseConditional();
    this.expect(':');
    const alternate = this.parseConditional();
    return { kind: 'conditional', test, consequent, alternate };
  }

  private parseLogicalOr(): ExpressionNode {
    let node = this.parseLogicalAnd();
    while (this.match('||')) {
      node = { kind: 'binary', op: '||', left: node, right: this.parseLogicalAnd() };
    }
    return node;
  }

  private parseLogicalAnd(): ExpressionNode {
    let node = this.parseEquality();
    while (this.match('&&')) {
      node = { kind: 'binary', op: '&&', left: node, right: this.parseEquality() };
    }
    return node;
  }

  private parseEquality(): ExpressionNode {
    let node = this.parseRelational();
    while (true) {
      const op = this.peek().value;
      if (op !== '==' && op !== '!=' && op !== '===' && op !== '!==') break;
      this.advance();
      node = { kind: 'binary', op, left: node, right: this.parseRelational() };
    }
    return node;
  }

  private parseRelational(): ExpressionNode {
    let node = this.parseAdditive();
    while (true) {
      const op = this.peek().value;
      if (op !== '<' && op !== '<=' && op !== '>' && op !== '>=') break;
      this.advance();
      node = { kind: 'binary', op, left: node, right: this.parseAdditive() };
    }
    return node;
  }

  private parseAdditive(): ExpressionNode {
    let node = this.parseMultiplicative();
    while (true) {
      const op = this.peek().value;
      if (op !== '+' && op !== '-') break;
      this.advance();
      node = { kind: 'binary', op, left: node, right: this.parseMultiplicative() };
    }
    return node;
  }

  private parseMultiplicative(): ExpressionNode {
    let node = this.parseUnary();
    while (true) {
      const op = this.peek().value;
      if (op !== '*' && op !== '/' && op !== '%') break;
      this.advance();
      node = { kind: 'binary', op, left: node, right: this.parseUnary() };
    }
    return node;
  }

  private parseUnary(): ExpressionNode {
    const op = this.peek().value;
    if (op === '!' || op === '+' || op === '-') {
      this.advance();
      return { kind: 'unary', op, argument: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): ExpressionNode {
    let node = this.parsePrimary();
    while (true) {
      if (this.match('.')) {
        node = { kind: 'member', object: node, property: this.expectIdentifier() };
        continue;
      }
      if (this.match('(')) {
        const args: ExpressionNode[] = [];
        if (!this.match(')')) {
          do {
            args.push(this.parseConditional());
          } while (this.match(','));
          this.expect(')');
        }
        node = { kind: 'call', callee: node, args };
        continue;
      }
      break;
    }
    return node;
  }

  private parsePrimary(): ExpressionNode {
    const token = this.advance();
    if (token.type === 'number') return { kind: 'literal', value: Number(token.value) };
    if (token.type === 'string') return { kind: 'literal', value: token.value };
    if (token.type === 'identifier') {
      if (token.value === 'true') return { kind: 'literal', value: true };
      if (token.value === 'false') return { kind: 'literal', value: false };
      if (token.value === 'null') return { kind: 'literal', value: null };
      return { kind: 'variable', name: token.value };
    }
    if (token.value === '(') {
      const node = this.parseConditional();
      this.expect(')');
      return node;
    }
    throw new Error(`表达式缺少值，遇到 ${token.value || '结尾'}`);
  }
}

function cattcaTruthy(value: EvalValue): boolean {
  if (value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0 && !Number.isNaN(value);
  if (typeof value === 'string') return value.length > 0;
  return true;
}

function toNumber(value: EvalValue): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === null) return 0;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? 0 : Number(trimmed);
  }
  throw new Error('函数或命名空间不能作为数字使用');
}

function toDisplay(value: EvalValue): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null) return 'null';
  throw new Error('函数或命名空间不能作为文本使用');
}

function strictEquals(left: EvalValue, right: EvalValue): boolean {
  return left === right;
}

function looseEquals(left: EvalValue, right: EvalValue): boolean {
  if (left === right) return true;
  if (left === null || right === null) return false;
  if (typeof left === 'boolean') return looseEquals(left ? 1 : 0, right);
  if (typeof right === 'boolean') return looseEquals(left, right ? 1 : 0);
  if (typeof left === 'number' && typeof right === 'string') return left === toNumber(right);
  if (typeof left === 'string' && typeof right === 'number') return toNumber(left) === right;
  return false;
}

function compareValues(left: EvalValue, right: EvalValue, op: string): boolean {
  let a: number | string;
  let b: number | string;
  if (typeof left === 'string' && typeof right === 'string') {
    a = left;
    b = right;
  } else {
    a = toNumber(left);
    b = toNumber(right);
  }
  switch (op) {
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    default:
      return false;
  }
}

function evaluateNode(
  node: ExpressionNode,
  variables: Readonly<Record<string, CattcaValue>>,
  depth: number,
): EvalValue {
  if (depth > CATTCA_LIMITS.expressionDepth) throw new Error('表达式嵌套过深');
  switch (node.kind) {
    case 'literal':
      return node.value;
    case 'variable':
      if (hasOwn(variables, node.name)) return variables[node.name];
      if (node.name === 'Math') return MATH_NAMESPACE;
      throw new Error(`未声明变量：${node.name}`);
    case 'unary': {
      const value = evaluateNode(node.argument, variables, depth + 1);
      if (node.op === '!') return !cattcaTruthy(value);
      if (node.op === '+') return toNumber(value);
      return -toNumber(value);
    }
    case 'conditional':
      return cattcaTruthy(evaluateNode(node.test, variables, depth + 1))
        ? evaluateNode(node.consequent, variables, depth + 1)
        : evaluateNode(node.alternate, variables, depth + 1);
    case 'member': {
      const object = evaluateNode(node.object, variables, depth + 1);
      if (object !== MATH_NAMESPACE) throw new Error('只允许访问 Math 命名空间');
      if (hasOwn(MATH_CONSTANTS, node.property)) return MATH_CONSTANTS[node.property];
      if (hasOwn(MATH_FUNCTIONS, node.property)) {
        return { kind: 'math-function', name: node.property };
      }
      throw new Error(`Math 不支持成员：${node.property}`);
    }
    case 'call': {
      const callee = evaluateNode(node.callee, variables, depth + 1);
      if (typeof callee !== 'object' || callee === null || callee === MATH_NAMESPACE
        || !('kind' in callee) || callee.kind !== 'math-function') {
        throw new Error('只能调用 Math 命名空间中的函数');
      }
      const args = node.args.map((argument) => toNumber(evaluateNode(argument, variables, depth + 1)));
      return MATH_FUNCTIONS[callee.name](...args);
    }
    case 'binary': {
      if (node.op === '&&') {
        const left = evaluateNode(node.left, variables, depth + 1);
        return cattcaTruthy(left) ? evaluateNode(node.right, variables, depth + 1) : left;
      }
      if (node.op === '||') {
        const left = evaluateNode(node.left, variables, depth + 1);
        return cattcaTruthy(left) ? left : evaluateNode(node.right, variables, depth + 1);
      }
      const left = evaluateNode(node.left, variables, depth + 1);
      const right = evaluateNode(node.right, variables, depth + 1);
      switch (node.op) {
        case '+':
          if (typeof left === 'string' || typeof right === 'string') {
            return toDisplay(left) + toDisplay(right);
          }
          return toNumber(left) + toNumber(right);
        case '-':
          return toNumber(left) - toNumber(right);
        case '*':
          return toNumber(left) * toNumber(right);
        case '/':
          return toNumber(left) / toNumber(right);
        case '%':
          return toNumber(left) % toNumber(right);
        case '==':
          return looseEquals(left, right);
        case '!=':
          return !looseEquals(left, right);
        case '===':
          return strictEquals(left, right);
        case '!==':
          return !strictEquals(left, right);
        case '<':
        case '<=':
        case '>':
        case '>=':
          return compareValues(left, right, node.op);
        default:
          throw new Error(`不支持的运算符：${node.op}`);
      }
    }
    default:
      throw new Error('无法识别的表达式');
  }
}

export function evaluateCattcaExpression(
  expression: string,
  variables: Readonly<Record<string, CattcaValue>> = {},
): CattcaValue {
  if (expression.length > CATTCA_LIMITS.expressionLength) {
    throw new Error(`表达式过长（最多 ${CATTCA_LIMITS.expressionLength} 个字符）`);
  }
  const tokens = tokenizeExpression(expression);
  const parser = new ExpressionParser(tokens);
  const result = evaluateNode(parser.parse(), variables, 0);
  if (typeof result === 'object' && result !== null) {
    throw new Error('表达式结果是函数或命名空间，不能直接输出');
  }
  return result;
}

/* --------------------------------------------------------------- execution */

interface RuntimeContext {
  pointer: number;
  readonly vars: Record<string, CattcaValue>;
  readonly output: CattcaOutputEntry[];
  readonly logs: string[];
  readonly programLabels: ReadonlyMap<string, number>;
  outputChars: number;
}

interface CommandResult {
  readonly jump?: number;
  readonly stop?: boolean;
  readonly pending?: CattcaPending;
  readonly error?: string;
}

function pushLog(context: RuntimeContext, message: string): void {
  if (context.logs.length >= CATTCA_LIMITS.logEntries) return;
  context.logs.push(message);
}

function appendOutput(
  context: RuntimeContext,
  kind: CattcaOutputEntry['kind'],
  text: string,
): string | null {
  if (!text) return null;
  if (context.output.length >= CATTCA_LIMITS.outputEntries) {
    return `输出条目过多（最多 ${CATTCA_LIMITS.outputEntries} 条）`;
  }
  if (context.outputChars + text.length > CATTCA_LIMITS.outputChars) {
    return `输出文本过长（最多 ${CATTCA_LIMITS.outputChars} 个字符）`;
  }
  context.outputChars += text.length;
  context.output.push(Object.freeze({ id: context.output.length, kind, text }));
  return null;
}

function evaluateOrFallback(expression: string, context: RuntimeContext): CattcaValue {
  try {
    return evaluateCattcaExpression(expression, context.vars);
  } catch (error) {
    pushLog(context, `无法计算表达式：${expression || '(空)'}（${errorMessage(error)}）`);
    return expression.trim();
  }
}

function evaluateCondition(expression: string, context: RuntimeContext): boolean {
  try {
    return cattcaTruthy(evaluateCattcaExpression(expression, context.vars));
  } catch (error) {
    pushLog(context, `无法计算条件：${expression || '(空)'}（${errorMessage(error)}）`);
    return false;
  }
}

function setVariable(
  context: RuntimeContext,
  name: string,
  value: CattcaValue,
  requireDeclared: boolean,
): string | null {
  if (requireDeclared && !hasOwn(context.vars, name)) {
    return `变量未声明：${name}`;
  }
  if (!hasOwn(context.vars, name) && Object.keys(context.vars).length >= CATTCA_LIMITS.variables) {
    return `变量过多（最多 ${CATTCA_LIMITS.variables} 个）`;
  }
  context.vars[name] = value;
  return null;
}

function executeCommand(
  command: CattcaCommand,
  context: RuntimeContext,
  instruction: number,
  depth = 0,
): CommandResult {
  if (depth > CATTCA_LIMITS.commandDepth) return { error: '命令嵌套过深' };
  switch (command.kind) {
    case 'let': {
      const value = command.expression === null
        ? null
        : evaluateOrFallback(command.expression, context);
      const failure = setVariable(context, command.name, value, false);
      return failure ? { error: failure } : {};
    }
    case 'set': {
      const value = evaluateOrFallback(command.expression, context);
      const failure = setVariable(context, command.name, value, true);
      return failure ? { error: failure } : {};
    }
    case 'apply': {
      const value = evaluateOrFallback(command.expression, context);
      const failure = appendOutput(context, 'value', toDisplay(value));
      return failure ? { error: failure } : {};
    }
    case 'log': {
      const value = evaluateOrFallback(command.expression, context);
      pushLog(context, toDisplay(value));
      return {};
    }
    case 'label':
      return {};
    case 'goto': {
      const target = context.programLabels.get(command.name);
      if (target === undefined) {
        pushLog(context, `goto 未找到标签：${command.name}`);
        return {};
      }
      return { jump: target };
    }
    case 'if':
      if (!evaluateCondition(command.condition, context)) return {};
      return executeCommand(command.then, context, instruction, depth + 1);
    case 'inputCase': {
      const pending: CattcaPending = Object.freeze({
        kind: 'choice',
        instruction,
        variable: command.variable,
        options: Object.freeze(command.options.map((option, index) =>
          Object.freeze({ index, label: option.label }))),
      });
      return { pending };
    }
    case 'inputText':
      if (!hasOwn(context.vars, command.name)) {
        return { error: `变量未声明：${command.name}（input text 前请先使用 let）` };
      }
      return {
        pending: Object.freeze({ kind: 'text', instruction, variable: command.name }),
      };
    case 'exit':
      return { stop: true };
    case 'unknown':
      pushLog(context, `未知命令：${command.raw}`);
      return {};
    default:
      return {};
  }
}

function createContext(
  program: CattcaProgram,
  vars: Record<string, CattcaValue>,
  output: CattcaOutputEntry[],
  logs: string[],
): RuntimeContext {
  return {
    pointer: 0,
    vars,
    output,
    logs,
    outputChars: output.reduce((total, entry) => total + entry.text.length, 0),
    programLabels: program.labels,
  };
}

function snapshot(
  context: RuntimeContext,
  pending: CattcaPending | null,
  finished: boolean,
  error: string | null,
): CattcaState {
  return Object.freeze({
    variables: Object.freeze({ ...context.vars }),
    output: Object.freeze([...context.output]),
    logs: Object.freeze([...context.logs]),
    pending,
    finished: finished || error !== null,
    error,
  });
}

function errorState(error: string): CattcaState {
  return Object.freeze({
    variables: Object.freeze({}),
    output: Object.freeze([]),
    logs: Object.freeze([]),
    pending: null,
    finished: true,
    error,
  });
}

function runProgram(
  program: CattcaProgram,
  context: RuntimeContext,
  start: number,
): CattcaState {
  let pointer = start;
  let pending: CattcaPending | null = null;
  let finished = false;
  let error: string | null = null;
  let steps = 0;

  while (!pending && !finished && !error) {
    if (pointer < 0 || pointer >= program.instructions.length) {
      finished = true;
      break;
    }
    if (steps >= CATTCA_LIMITS.stepsPerResume) {
      error = `剧本执行步数超出限制（${CATTCA_LIMITS.stepsPerResume} 步），可能存在无限循环`;
      break;
    }
    steps += 1;
    const instruction = program.instructions[pointer];
    if (instruction.type === 'text') {
      const failure = appendOutput(context, 'text', instruction.text);
      if (failure) {
        error = failure;
        break;
      }
      pointer += 1;
      continue;
    }
    const result = executeCommand(instruction.command, context, pointer);
    if (result.error) {
      error = result.error;
      break;
    }
    if (result.stop) {
      finished = true;
      break;
    }
    if (result.pending) {
      pending = result.pending;
      break;
    }
    pointer = result.jump ?? pointer + 1;
  }

  return snapshot(context, pending, finished, error);
}

export function startCattca(program: CattcaProgram): CattcaState {
  if (program.error) return errorState(program.error);
  const context = createContext(program, {}, [], []);
  return runProgram(program, context, 0);
}

export function chooseCattca(
  program: CattcaProgram,
  state: CattcaState,
  index: number,
): CattcaState {
  const pending = state.pending;
  if (!pending || pending.kind !== 'choice') return state;
  const context = createContext(
    program,
    { ...state.variables },
    [...state.output],
    [...state.logs],
  );
  const option = pending.options[index];
  if (!option) {
    pushLog(context, `无效的选项索引：${index}`);
    return runProgram(program, context, pending.instruction + 1);
  }
  if (pending.variable) {
    const failure = setVariable(context, pending.variable, option.label, false);
    if (failure) return snapshot(context, null, true, failure);
  }
  const selected = program.instructions[pending.instruction];
  const command = selected && selected.type === 'command'
    && selected.command.kind === 'inputCase'
    ? selected.command.options[index]?.command
    : undefined;
  if (!command) {
    pushLog(context, `选项未找到对应命令：${option.label}`);
    return runProgram(program, context, pending.instruction + 1);
  }
  const result = executeCommand(command, context, pending.instruction);
  if (result.error) return snapshot(context, null, true, result.error);
  if (result.stop) return snapshot(context, null, true, null);
  if (result.pending) return snapshot(context, result.pending, false, null);
  return runProgram(program, context, result.jump ?? pending.instruction + 1);
}

export function submitCattcaText(
  program: CattcaProgram,
  state: CattcaState,
  value: string,
): CattcaState {
  const pending = state.pending;
  if (!pending || pending.kind !== 'text') return state;
  const context = createContext(
    program,
    { ...state.variables },
    [...state.output],
    [...state.logs],
  );
  context.vars[pending.variable] = value.slice(0, CATTCA_LIMITS.inputLength);
  return runProgram(program, context, pending.instruction + 1);
}

export function restartCattca(program: CattcaProgram): CattcaState {
  return startCattca(program);
}
