import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createReactHost, defineReactComponentPackage } from "reactive-md/react";
import { defineLocalComponent } from "reactive-md/sdk";
import { jsx, jsxs } from "react/jsx-runtime";
// src/component.css?raw
var component_default = ".local-document .rmd-cattca {\n  --rmd-cattca-height: 420px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  margin: 16px 0;\n  padding: 16px;\n  color: var(--ink);\n  background: var(--surface);\n  border: 1px solid var(--line);\n  border-radius: var(--radius-panel, 12px);\n  box-shadow: var(--shadow-sm);\n  font-family: var(--font-sans);\n}\n\n.local-document .rmd-cattca-head {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px 12px;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.local-document .rmd-cattca-heading {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  align-items: baseline;\n  min-width: 0;\n}\n\n.local-document .rmd-cattca-title {\n  font-size: 1rem;\n  font-weight: 650;\n  letter-spacing: 0.01em;\n}\n\n.local-document .rmd-cattca-status {\n  color: var(--ink-muted);\n  font-size: 0.8rem;\n}\n\n.local-document .rmd-cattca-action,\n.local-document .rmd-cattca-choice,\n.local-document .rmd-cattca-submit {\n  min-height: 44px;\n  padding: 9px 14px;\n  color: var(--ink);\n  background: var(--surface-subtle);\n  border: 1px solid var(--line-strong);\n  border-radius: var(--radius-control, 8px);\n  font: inherit;\n  line-height: 1.4;\n  cursor: pointer;\n}\n\n.local-document .rmd-cattca-action:hover,\n.local-document .rmd-cattca-choice:hover,\n.local-document .rmd-cattca-submit:hover {\n  background: var(--surface-hover);\n}\n\n.local-document .rmd-cattca-action:focus-visible,\n.local-document .rmd-cattca-choice:focus-visible,\n.local-document .rmd-cattca-submit:focus-visible,\n.local-document .rmd-cattca-input:focus-visible {\n  outline: 2px solid var(--focus-outline, var(--accent));\n  outline-offset: 2px;\n}\n\n.local-document .rmd-cattca-action:disabled,\n.local-document .rmd-cattca-choice:disabled,\n.local-document .rmd-cattca-submit:disabled,\n.local-document .rmd-cattca-input:disabled {\n  cursor: not-allowed;\n  opacity: 0.55;\n}\n\n.local-document .rmd-cattca-transcript {\n  min-height: 160px;\n  max-height: var(--rmd-cattca-height);\n  padding: 14px 16px;\n  overflow: auto;\n  background: var(--surface-subtle);\n  border: 1px solid var(--line);\n  border-radius: var(--radius-card, 10px);\n  line-height: 1.8;\n  overscroll-behavior: contain;\n}\n\n.local-document .rmd-cattca-line {\n  margin: 0;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n.local-document .rmd-cattca-line + .rmd-cattca-line {\n  margin-top: 2px;\n}\n\n.local-document .rmd-cattca-line[data-cattca-line='value'] {\n  color: var(--accent-text, var(--accent));\n  font-weight: 600;\n}\n\n.local-document .rmd-cattca-choices {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.local-document .rmd-cattca-choice {\n  width: 100%;\n  text-align: start;\n}\n\n.local-document .rmd-cattca-choice::before {\n  content: '›';\n  margin-inline-end: 8px;\n  color: var(--accent-text, var(--accent));\n}\n\n.local-document .rmd-cattca-form {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.local-document .rmd-cattca-label {\n  color: var(--ink-muted);\n  font-size: 0.86rem;\n}\n\n.local-document .rmd-cattca-input {\n  min-height: 44px;\n  padding: 8px 12px;\n  color: var(--ink);\n  background: var(--surface);\n  border: 1px solid var(--line-strong);\n  border-radius: var(--radius-field, 8px);\n  font: inherit;\n}\n\n.local-document .rmd-cattca-input-row {\n  display: flex;\n  gap: 8px;\n}\n\n.local-document .rmd-cattca-input-row .rmd-cattca-input {\n  flex: 1 1 auto;\n  min-width: 0;\n}\n\n.local-document .rmd-cattca-error {\n  margin: 0;\n  padding: 10px 12px;\n  color: var(--danger);\n  background: var(--danger-soft);\n  border: 1px solid var(--danger-line);\n  border-radius: var(--radius-control, 8px);\n}\n\n.local-document .rmd-cattca-end {\n  margin: 0;\n  color: var(--ink-muted);\n  font-size: 0.86rem;\n  text-align: end;\n}\n\n.local-document .rmd-cattca-debug {\n  padding: 10px 12px;\n  background: var(--code-bg, var(--surface-subtle));\n  border: 1px solid var(--line);\n  border-radius: var(--radius-control, 8px);\n  font-family: var(--font-mono);\n  font-size: 0.8rem;\n}\n\n.local-document .rmd-cattca-debug summary {\n  cursor: pointer;\n  font-weight: 600;\n}\n\n.local-document .rmd-cattca-debug dl {\n  display: grid;\n  grid-template-columns: max-content 1fr;\n  gap: 4px 12px;\n  margin: 8px 0 0;\n}\n\n.local-document .rmd-cattca-debug dl div {\n  display: contents;\n}\n\n.local-document .rmd-cattca-debug dt {\n  color: var(--ink-muted);\n}\n\n.local-document .rmd-cattca-debug dd {\n  margin: 0;\n  overflow-wrap: anywhere;\n}\n\n.local-document .rmd-cattca-debug ol {\n  margin: 8px 0 0;\n  padding-inline-start: 20px;\n}\n\n.local-document .rmd-cattca-debug li {\n  margin: 2px 0;\n  overflow-wrap: anywhere;\n}\n\n@media (max-width: 520px) {\n  .local-document .rmd-cattca {\n    padding: 12px;\n  }\n\n  .local-document .rmd-cattca-input-row {\n    flex-direction: column;\n  }\n}\n";
// src/manifests.ts
/**
* `<cattca>`: a container that reads a Cattca script from a fenced code block
* and renders it as an interactive novel. The manifest stays plain JSON data;
* the React implementation and the safe interpreter live next to it.
*/
var cattca = defineLocalComponent({
	id: "example/cattca",
	name: "cattca",
	version: "1.0.0",
	protocol: "reactive-md-component/v1",
	form: "container",
	props: {
		label: {
			kind: "string",
			default: "互动小说"
		},
		height: {
			kind: "number",
			dynamic: true,
			default: 420,
			integer: true,
			min: 200,
			max: 900,
			description: {
				en: "Maximum transcript height in pixels.",
				zh: "正文区域的最高高度（像素）。"
			}
		},
		debug: {
			kind: "boolean",
			dynamic: true,
			default: false,
			description: {
				en: "Show variables and interpreter logs below the story.",
				zh: "在故事下方显示变量与解释器日志。"
			}
		},
		disabled: {
			kind: "boolean",
			dynamic: true,
			default: false
		}
	},
	structure: {
		rule: "content",
		label: "none",
		noComponents: true
	},
	capabilities: {
		interactive: true,
		static: true,
		ssr: true,
		offline: true
	},
	authoring: {
		title: {
			en: "Cattca story",
			zh: "Cattca 互动小说"
		},
		description: {
			en: "Play an interactive story written in Cattca command syntax inside a fenced cattca code block.",
			zh: "在 cattca 代码围栏中编写 Cattca 命令，直接播放互动小说。"
		},
		category: "interactive",
		insertText: "<cattca label=\"互动小说\">\n```cattca\n你站在一扇门前。\n</let 尝试次数 = 0; label 门口;/>\n你要怎么做？\n</input case:\n  '推门' -> goto 推门:\n  '离开' -> goto 离开;\n/>\n</label 推门; set 尝试次数 = 尝试次数 + 1;\nif 尝试次数 > 2 -> goto 放弃/>\n门纹丝不动。\n</goto 门口;/>\n</label 放弃/>\n你放弃了，转身离开。\n</exit/>\n</label 离开/>\n你离开了。\n</exit/>\n```\n</cattca>"
	},
	styles: ["example/cattca.css"]
});
// src/cattca-engine.ts
var CATTCA_LIMITS = Object.freeze({
	scriptLength: 1e5,
	instructions: 5e3,
	variables: 1e3,
	outputEntries: 1e4,
	outputChars: 5e5,
	logEntries: 2e3,
	stepsPerResume: 2e4,
	expressionLength: 2e3,
	expressionDepth: 32,
	commandDepth: 16,
	choiceOptions: 64,
	nameLength: 128,
	inputLength: 2e3
});
var IDENTIFIER_START = /^[\p{L}_$]$/u;
var IDENTIFIER_PART = /^[\p{L}\p{N}_$]$/u;
var NUMBER_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
function hasOwn(object, key) {
	return Object.prototype.hasOwnProperty.call(object, key);
}
function isIdentifier(value) {
	if (value.length === 0 || value.length > CATTCA_LIMITS.nameLength) return false;
	const chars = Array.from(value);
	if (!IDENTIFIER_START.test(chars[0])) return false;
	for (let index = 1; index < chars.length; index += 1) if (!IDENTIFIER_PART.test(chars[index])) return false;
	return true;
}
function decodeEscapes(value) {
	let result = "";
	for (let index = 0; index < value.length; index += 1) {
		const char = value[index];
		if (char !== "\\") {
			result += char;
			continue;
		}
		const next = value[index + 1];
		if (next === void 0) {
			result += "\\";
			break;
		}
		index += 1;
		switch (next) {
			case "n":
				result += "\n";
				break;
			case "r":
				result += "\r";
				break;
			case "t":
				result += "	";
				break;
			case "\\":
				result += "\\";
				break;
			case "'":
				result += "'";
				break;
			case "\"":
				result += "\"";
				break;
			default: result += next;
		}
	}
	return result;
}
function unquote(value) {
	const trimmed = value.trim();
	const first = trimmed[0];
	const last = trimmed[trimmed.length - 1];
	if (trimmed.length >= 2 && (first === "'" || first === "\"") && last === first) return decodeEscapes(trimmed.slice(1, -1));
	return trimmed;
}
function readVariableName(value) {
	const name = unquote(value);
	if (!isIdentifier(name)) throw new Error(`无效的变量名：${name || "(空)"}`);
	return name;
}
function readLabelName(value) {
	const trimmed = value.trim();
	if (!trimmed) throw new Error("缺少标签名");
	if (trimmed[0] === "'" || trimmed[0] === "\"") {
		const label = unquote(trimmed);
		if (!label) throw new Error("标签名不能为空");
		return label;
	}
	if (!isIdentifier(trimmed)) throw new Error(`无效的标签名：${trimmed}`);
	return trimmed;
}
function splitTopLevel(source, separator) {
	const parts = [];
	let start = 0;
	let quote = null;
	let escaped = false;
	let depth = 0;
	for (let index = 0; index < source.length; index += 1) {
		const char = source[index];
		if (quote) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === "'" || char === "\"") {
			quote = char;
			continue;
		}
		if (char === "(" || char === "[" || char === "{") {
			depth += 1;
			continue;
		}
		if (char === ")" || char === "]" || char === "}") {
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
function findTopLevel(source, separator) {
	let quote = null;
	let escaped = false;
	let depth = 0;
	for (let index = 0; index < source.length; index += 1) {
		const char = source[index];
		if (quote) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === "'" || char === "\"") {
			quote = char;
			continue;
		}
		if (char === "(" || char === "[" || char === "{") {
			depth += 1;
			continue;
		}
		if (char === ")" || char === "]" || char === "}") {
			depth = Math.max(0, depth - 1);
			continue;
		}
		if (depth === 0 && source.startsWith(separator, index)) return index;
	}
	return -1;
}
function findCommandClose(source, start) {
	let quote = null;
	let escaped = false;
	for (let index = start; index < source.length - 1; index += 1) {
		const char = source[index];
		if (quote) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === "'" || char === "\"") {
			quote = char;
			continue;
		}
		if (char === "/" && source[index + 1] === ">") return index;
	}
	return -1;
}
function parseInputCase(rest) {
	const trimmed = rest.trim();
	if (!trimmed) throw new Error("input case 缺少选项");
	let variable = null;
	let optionSource = trimmed;
	if (trimmed.startsWith(":")) optionSource = trimmed.slice(1);
	else {
		const colon = findTopLevel(trimmed, ":");
		if (colon < 0) throw new Error("input case 缺少选项冒号");
		const name = trimmed.slice(0, colon).trim();
		if (name) variable = readVariableName(name);
		optionSource = trimmed.slice(colon + 1);
	}
	const options = [];
	for (const part of splitTopLevel(optionSource, ":")) {
		const option = part.trim();
		if (!option) continue;
		const arrow = findTopLevel(option, "->");
		if (arrow < 0) throw new Error(`input case 选项缺少 ->：${option}`);
		const label = unquote(option.slice(0, arrow));
		if (!label) throw new Error("input case 选项文本不能为空");
		const commandSource = option.slice(arrow + 2).trim();
		if (!commandSource) throw new Error(`input case 选项缺少命令：${label}`);
		const command = parseCommand(commandSource);
		if (!command) throw new Error(`input case 选项缺少命令：${label}`);
		options.push({
			label,
			command
		});
	}
	if (options.length === 0) throw new Error("input case 至少需要一个选项");
	if (options.length > CATTCA_LIMITS.choiceOptions) throw new Error(`input case 选项过多（最多 ${CATTCA_LIMITS.choiceOptions} 个）`);
	return {
		kind: "inputCase",
		variable,
		options
	};
}
function parseCommand(raw) {
	const text = raw.trim();
	if (!text) return null;
	if (text === "exit") return { kind: "exit" };
	if (text === "let" || /^let\s/u.test(text)) {
		const rest = text.slice(3).trim();
		if (!rest) throw new Error("let 缺少变量名");
		const equals = findTopLevel(rest, "=");
		if (equals < 0) return {
			kind: "let",
			name: readVariableName(rest),
			expression: null
		};
		return {
			kind: "let",
			name: readVariableName(rest.slice(0, equals)),
			expression: rest.slice(equals + 1).trim()
		};
	}
	if (text === "set" || /^set\s/u.test(text)) {
		const rest = text.slice(3).trim();
		const equals = findTopLevel(rest, "=");
		if (equals < 0) throw new Error("set 缺少 = 和表达式");
		return {
			kind: "set",
			name: readVariableName(rest.slice(0, equals)),
			expression: rest.slice(equals + 1).trim()
		};
	}
	if (text === "apply" || /^apply\s/u.test(text)) return {
		kind: "apply",
		expression: text.slice(5).trim()
	};
	if (text === "log" || /^log\s/u.test(text)) return {
		kind: "log",
		expression: text.slice(3).trim()
	};
	if (text === "label" || /^label\s/u.test(text)) return {
		kind: "label",
		name: readLabelName(text.slice(5))
	};
	if (text === "goto" || /^goto\s/u.test(text)) return {
		kind: "goto",
		name: readLabelName(text.slice(4))
	};
	if (text === "if" || /^if\s/u.test(text)) {
		const rest = text.slice(2).trim();
		const arrow = findTopLevel(rest, "->");
		if (arrow < 0) throw new Error("if 缺少 ->");
		const condition = rest.slice(0, arrow).trim();
		if (!condition) throw new Error("if 缺少条件");
		const then = parseCommand(rest.slice(arrow + 2).trim());
		if (!then) throw new Error("if 缺少 -> 后的命令");
		return {
			kind: "if",
			condition,
			then
		};
	}
	const inputText = /^input\s+text(?=\s|$)/u.exec(text);
	if (inputText) {
		const name = text.slice(inputText[0].length).trim();
		if (!name) throw new Error("input text 缺少变量名");
		return {
			kind: "inputText",
			name: readVariableName(name)
		};
	}
	const inputCase = /^input\s+case(?=\s|:|$)/u.exec(text);
	if (inputCase) return parseInputCase(text.slice(inputCase[0].length));
	return {
		kind: "unknown",
		raw: text
	};
}
function compileCattca(source) {
	try {
		if (source.length > CATTCA_LIMITS.scriptLength) throw new Error(`剧本过长（最多 ${CATTCA_LIMITS.scriptLength} 个字符）`);
		const normalized = source.replace(/\r\n?/g, "\n");
		const instructions = [];
		const labels = /* @__PURE__ */ new Map();
		const pushText = (text) => {
			if (!text.trim()) return;
			instructions.push({
				type: "text",
				text
			});
			if (instructions.length > CATTCA_LIMITS.instructions) throw new Error(`指令过多（最多 ${CATTCA_LIMITS.instructions} 条）`);
		};
		let cursor = 0;
		while (cursor < normalized.length) {
			const open = normalized.indexOf("</", cursor);
			if (open < 0) {
				pushText(normalized.slice(cursor));
				break;
			}
			pushText(normalized.slice(cursor, open));
			const close = findCommandClose(normalized, open + 2);
			if (close < 0) throw new Error("命令块缺少结束定界符 />");
			const block = normalized.slice(open + 2, close);
			for (const raw of splitTopLevel(block, ";")) {
				const command = parseCommand(raw);
				if (!command) continue;
				if (command.kind === "label") {
					labels.set(command.name, instructions.length);
					continue;
				}
				instructions.push({
					type: "command",
					command
				});
				if (instructions.length > CATTCA_LIMITS.instructions) throw new Error(`指令过多（最多 ${CATTCA_LIMITS.instructions} 条）`);
			}
			cursor = close + 2;
			if (normalized[cursor] === "\n") cursor += 1;
		}
		return {
			instructions,
			labels,
			error: null
		};
	} catch (error) {
		return {
			instructions: [],
			labels: /* @__PURE__ */ new Map(),
			error: errorMessage(error)
		};
	}
}
var MATH_NAMESPACE = Object.freeze({ kind: "math-namespace" });
var MATH_CONSTANTS = Object.freeze({
	E: Math.E,
	PI: Math.PI
});
var MATH_FUNCTIONS = Object.freeze({
	abs: (value) => Math.abs(value),
	ceil: (value) => Math.ceil(value),
	floor: (value) => Math.floor(value),
	max: (...values) => Math.max(...values),
	min: (...values) => Math.min(...values),
	pow: (base, exponent) => Math.pow(base, exponent),
	round: (value) => Math.round(value),
	sign: (value) => Math.sign(value),
	sqrt: (value) => Math.sqrt(value),
	trunc: (value) => Math.trunc(value)
});
function tokenizeExpression(source) {
	const tokens = [];
	let index = 0;
	while (index < source.length) {
		const char = source[index];
		if (/\s/u.test(char)) {
			index += 1;
			continue;
		}
		if (char === "'" || char === "\"") {
			const quote = char;
			let value = "";
			index += 1;
			let closed = false;
			while (index < source.length) {
				const current = source[index];
				if (current === "\\") {
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
			if (!closed) throw new Error("字符串缺少结束引号");
			tokens.push({
				type: "string",
				value: decodeEscapes(value)
			});
			continue;
		}
		const number = NUMBER_PATTERN.exec(source.slice(index));
		if (number && number[0].length > 0) {
			tokens.push({
				type: "number",
				value: number[0]
			});
			index += number[0].length;
			continue;
		}
		if (IDENTIFIER_START.test(char)) {
			let end = index + 1;
			while (end < source.length && IDENTIFIER_PART.test(source[end])) end += 1;
			tokens.push({
				type: "identifier",
				value: source.slice(index, end)
			});
			index = end;
			continue;
		}
		const three = source.slice(index, index + 3);
		if (three === "===" || three === "!==") {
			tokens.push({
				type: "operator",
				value: three
			});
			index += 3;
			continue;
		}
		const two = source.slice(index, index + 2);
		if (two === "==" || two === "!=" || two === "<=" || two === ">=" || two === "&&" || two === "||") {
			tokens.push({
				type: "operator",
				value: two
			});
			index += 2;
			continue;
		}
		if ("+-*/%!<>".includes(char)) {
			tokens.push({
				type: "operator",
				value: char
			});
			index += 1;
			continue;
		}
		if ("?:(),.".includes(char)) {
			tokens.push({
				type: "punctuation",
				value: char
			});
			index += 1;
			continue;
		}
		throw new Error(`无法识别的表达式字符：${char}`);
	}
	tokens.push({
		type: "eof",
		value: ""
	});
	return tokens;
}
var ExpressionParser = class {
	tokens;
	index = 0;
	constructor(tokens) {
		this.tokens = tokens;
	}
	parse() {
		const node = this.parseConditional();
		if (this.peek().type !== "eof") throw new Error(`表达式中存在多余内容：${this.peek().value}`);
		return node;
	}
	peek() {
		return this.tokens[this.index] ?? {
			type: "eof",
			value: ""
		};
	}
	advance() {
		const token = this.peek();
		this.index += 1;
		return token;
	}
	match(value) {
		if (this.peek().value !== value) return false;
		this.index += 1;
		return true;
	}
	expect(value) {
		if (!this.match(value)) throw new Error(`表达式缺少 ${value}，遇到 ${this.peek().value || "结尾"}`);
	}
	expectIdentifier() {
		const token = this.advance();
		if (token.type !== "identifier") throw new Error(`表达式缺少标识符，遇到 ${token.value || "结尾"}`);
		return token.value;
	}
	parseConditional() {
		const test = this.parseLogicalOr();
		if (!this.match("?")) return test;
		const consequent = this.parseConditional();
		this.expect(":");
		return {
			kind: "conditional",
			test,
			consequent,
			alternate: this.parseConditional()
		};
	}
	parseLogicalOr() {
		let node = this.parseLogicalAnd();
		while (this.match("||")) node = {
			kind: "binary",
			op: "||",
			left: node,
			right: this.parseLogicalAnd()
		};
		return node;
	}
	parseLogicalAnd() {
		let node = this.parseEquality();
		while (this.match("&&")) node = {
			kind: "binary",
			op: "&&",
			left: node,
			right: this.parseEquality()
		};
		return node;
	}
	parseEquality() {
		let node = this.parseRelational();
		while (true) {
			const op = this.peek().value;
			if (op !== "==" && op !== "!=" && op !== "===" && op !== "!==") break;
			this.advance();
			node = {
				kind: "binary",
				op,
				left: node,
				right: this.parseRelational()
			};
		}
		return node;
	}
	parseRelational() {
		let node = this.parseAdditive();
		while (true) {
			const op = this.peek().value;
			if (op !== "<" && op !== "<=" && op !== ">" && op !== ">=") break;
			this.advance();
			node = {
				kind: "binary",
				op,
				left: node,
				right: this.parseAdditive()
			};
		}
		return node;
	}
	parseAdditive() {
		let node = this.parseMultiplicative();
		while (true) {
			const op = this.peek().value;
			if (op !== "+" && op !== "-") break;
			this.advance();
			node = {
				kind: "binary",
				op,
				left: node,
				right: this.parseMultiplicative()
			};
		}
		return node;
	}
	parseMultiplicative() {
		let node = this.parseUnary();
		while (true) {
			const op = this.peek().value;
			if (op !== "*" && op !== "/" && op !== "%") break;
			this.advance();
			node = {
				kind: "binary",
				op,
				left: node,
				right: this.parseUnary()
			};
		}
		return node;
	}
	parseUnary() {
		const op = this.peek().value;
		if (op === "!" || op === "+" || op === "-") {
			this.advance();
			return {
				kind: "unary",
				op,
				argument: this.parseUnary()
			};
		}
		return this.parsePostfix();
	}
	parsePostfix() {
		let node = this.parsePrimary();
		while (true) {
			if (this.match(".")) {
				node = {
					kind: "member",
					object: node,
					property: this.expectIdentifier()
				};
				continue;
			}
			if (this.match("(")) {
				const args = [];
				if (!this.match(")")) {
					do
						args.push(this.parseConditional());
					while (this.match(","));
					this.expect(")");
				}
				node = {
					kind: "call",
					callee: node,
					args
				};
				continue;
			}
			break;
		}
		return node;
	}
	parsePrimary() {
		const token = this.advance();
		if (token.type === "number") return {
			kind: "literal",
			value: Number(token.value)
		};
		if (token.type === "string") return {
			kind: "literal",
			value: token.value
		};
		if (token.type === "identifier") {
			if (token.value === "true") return {
				kind: "literal",
				value: true
			};
			if (token.value === "false") return {
				kind: "literal",
				value: false
			};
			if (token.value === "null") return {
				kind: "literal",
				value: null
			};
			return {
				kind: "variable",
				name: token.value
			};
		}
		if (token.value === "(") {
			const node = this.parseConditional();
			this.expect(")");
			return node;
		}
		throw new Error(`表达式缺少值，遇到 ${token.value || "结尾"}`);
	}
};
function cattcaTruthy(value) {
	if (value === null) return false;
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value !== 0 && !Number.isNaN(value);
	if (typeof value === "string") return value.length > 0;
	return true;
}
function toNumber(value) {
	if (typeof value === "number") return value;
	if (typeof value === "boolean") return value ? 1 : 0;
	if (value === null) return 0;
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed === "" ? 0 : Number(trimmed);
	}
	throw new Error("函数或命名空间不能作为数字使用");
}
function toDisplay(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	if (value === null) return "null";
	throw new Error("函数或命名空间不能作为文本使用");
}
function strictEquals(left, right) {
	return left === right;
}
function looseEquals(left, right) {
	if (left === right) return true;
	if (left === null || right === null) return false;
	if (typeof left === "boolean") return looseEquals(left ? 1 : 0, right);
	if (typeof right === "boolean") return looseEquals(left, right ? 1 : 0);
	if (typeof left === "number" && typeof right === "string") return left === toNumber(right);
	if (typeof left === "string" && typeof right === "number") return toNumber(left) === right;
	return false;
}
function compareValues(left, right, op) {
	let a;
	let b;
	if (typeof left === "string" && typeof right === "string") {
		a = left;
		b = right;
	} else {
		a = toNumber(left);
		b = toNumber(right);
	}
	switch (op) {
		case "<": return a < b;
		case "<=": return a <= b;
		case ">": return a > b;
		case ">=": return a >= b;
		default: return false;
	}
}
function evaluateNode(node, variables, depth) {
	if (depth > CATTCA_LIMITS.expressionDepth) throw new Error("表达式嵌套过深");
	switch (node.kind) {
		case "literal": return node.value;
		case "variable":
			if (hasOwn(variables, node.name)) return variables[node.name];
			if (node.name === "Math") return MATH_NAMESPACE;
			throw new Error(`未声明变量：${node.name}`);
		case "unary": {
			const value = evaluateNode(node.argument, variables, depth + 1);
			if (node.op === "!") return !cattcaTruthy(value);
			if (node.op === "+") return toNumber(value);
			return -toNumber(value);
		}
		case "conditional": return cattcaTruthy(evaluateNode(node.test, variables, depth + 1)) ? evaluateNode(node.consequent, variables, depth + 1) : evaluateNode(node.alternate, variables, depth + 1);
		case "member":
			if (evaluateNode(node.object, variables, depth + 1) !== MATH_NAMESPACE) throw new Error("只允许访问 Math 命名空间");
			if (hasOwn(MATH_CONSTANTS, node.property)) return MATH_CONSTANTS[node.property];
			if (hasOwn(MATH_FUNCTIONS, node.property)) return {
				kind: "math-function",
				name: node.property
			};
			throw new Error(`Math 不支持成员：${node.property}`);
		case "call": {
			const callee = evaluateNode(node.callee, variables, depth + 1);
			if (typeof callee !== "object" || callee === null || callee === MATH_NAMESPACE || !("kind" in callee) || callee.kind !== "math-function") throw new Error("只能调用 Math 命名空间中的函数");
			const args = node.args.map((argument) => toNumber(evaluateNode(argument, variables, depth + 1)));
			return MATH_FUNCTIONS[callee.name](...args);
		}
		case "binary": {
			if (node.op === "&&") {
				const left = evaluateNode(node.left, variables, depth + 1);
				return cattcaTruthy(left) ? evaluateNode(node.right, variables, depth + 1) : left;
			}
			if (node.op === "||") {
				const left = evaluateNode(node.left, variables, depth + 1);
				return cattcaTruthy(left) ? left : evaluateNode(node.right, variables, depth + 1);
			}
			const left = evaluateNode(node.left, variables, depth + 1);
			const right = evaluateNode(node.right, variables, depth + 1);
			switch (node.op) {
				case "+":
					if (typeof left === "string" || typeof right === "string") return toDisplay(left) + toDisplay(right);
					return toNumber(left) + toNumber(right);
				case "-": return toNumber(left) - toNumber(right);
				case "*": return toNumber(left) * toNumber(right);
				case "/": return toNumber(left) / toNumber(right);
				case "%": return toNumber(left) % toNumber(right);
				case "==": return looseEquals(left, right);
				case "!=": return !looseEquals(left, right);
				case "===": return strictEquals(left, right);
				case "!==": return !strictEquals(left, right);
				case "<":
				case "<=":
				case ">":
				case ">=": return compareValues(left, right, node.op);
				default: throw new Error(`不支持的运算符：${node.op}`);
			}
		}
		default: throw new Error("无法识别的表达式");
	}
}
function evaluateCattcaExpression(expression, variables = {}) {
	if (expression.length > CATTCA_LIMITS.expressionLength) throw new Error(`表达式过长（最多 ${CATTCA_LIMITS.expressionLength} 个字符）`);
	const result = evaluateNode(new ExpressionParser(tokenizeExpression(expression)).parse(), variables, 0);
	if (typeof result === "object" && result !== null) throw new Error("表达式结果是函数或命名空间，不能直接输出");
	return result;
}
function pushLog(context, message) {
	if (context.logs.length >= CATTCA_LIMITS.logEntries) return;
	context.logs.push(message);
}
function appendOutput(context, kind, text) {
	if (!text) return null;
	if (context.output.length >= CATTCA_LIMITS.outputEntries) return `输出条目过多（最多 ${CATTCA_LIMITS.outputEntries} 条）`;
	if (context.outputChars + text.length > CATTCA_LIMITS.outputChars) return `输出文本过长（最多 ${CATTCA_LIMITS.outputChars} 个字符）`;
	context.outputChars += text.length;
	context.output.push(Object.freeze({
		id: context.output.length,
		kind,
		text
	}));
	return null;
}
function evaluateOrFallback(expression, context) {
	try {
		return evaluateCattcaExpression(expression, context.vars);
	} catch (error) {
		pushLog(context, `无法计算表达式：${expression || "(空)"}（${errorMessage(error)}）`);
		return expression.trim();
	}
}
function evaluateCondition(expression, context) {
	try {
		return cattcaTruthy(evaluateCattcaExpression(expression, context.vars));
	} catch (error) {
		pushLog(context, `无法计算条件：${expression || "(空)"}（${errorMessage(error)}）`);
		return false;
	}
}
function setVariable(context, name, value, requireDeclared) {
	if (requireDeclared && !hasOwn(context.vars, name)) return `变量未声明：${name}`;
	if (!hasOwn(context.vars, name) && Object.keys(context.vars).length >= CATTCA_LIMITS.variables) return `变量过多（最多 ${CATTCA_LIMITS.variables} 个）`;
	context.vars[name] = value;
	return null;
}
function executeCommand(command, context, instruction, depth = 0) {
	if (depth > CATTCA_LIMITS.commandDepth) return { error: "命令嵌套过深" };
	switch (command.kind) {
		case "let": {
			const value = command.expression === null ? null : evaluateOrFallback(command.expression, context);
			const failure = setVariable(context, command.name, value, false);
			return failure ? { error: failure } : {};
		}
		case "set": {
			const value = evaluateOrFallback(command.expression, context);
			const failure = setVariable(context, command.name, value, true);
			return failure ? { error: failure } : {};
		}
		case "apply": {
			const failure = appendOutput(context, "value", toDisplay(evaluateOrFallback(command.expression, context)));
			return failure ? { error: failure } : {};
		}
		case "log":
			pushLog(context, toDisplay(evaluateOrFallback(command.expression, context)));
			return {};
		case "label": return {};
		case "goto": {
			const target = context.programLabels.get(command.name);
			if (target === void 0) {
				pushLog(context, `goto 未找到标签：${command.name}`);
				return {};
			}
			return { jump: target };
		}
		case "if":
			if (!evaluateCondition(command.condition, context)) return {};
			return executeCommand(command.then, context, instruction, depth + 1);
		case "inputCase": return { pending: Object.freeze({
			kind: "choice",
			instruction,
			variable: command.variable,
			options: Object.freeze(command.options.map((option, index) => Object.freeze({
				index,
				label: option.label
			})))
		}) };
		case "inputText":
			if (!hasOwn(context.vars, command.name)) return { error: `变量未声明：${command.name}（input text 前请先使用 let）` };
			return { pending: Object.freeze({
				kind: "text",
				instruction,
				variable: command.name
			}) };
		case "exit": return { stop: true };
		case "unknown":
			pushLog(context, `未知命令：${command.raw}`);
			return {};
		default: return {};
	}
}
function createContext(program, vars, output, logs) {
	return {
		pointer: 0,
		vars,
		output,
		logs,
		outputChars: output.reduce((total, entry) => total + entry.text.length, 0),
		programLabels: program.labels
	};
}
function snapshot(context, pending, finished, error) {
	return Object.freeze({
		variables: Object.freeze({ ...context.vars }),
		output: Object.freeze([...context.output]),
		logs: Object.freeze([...context.logs]),
		pending,
		finished: finished || error !== null,
		error
	});
}
function errorState(error) {
	return Object.freeze({
		variables: Object.freeze({}),
		output: Object.freeze([]),
		logs: Object.freeze([]),
		pending: null,
		finished: true,
		error
	});
}
function runProgram(program, context, start) {
	let pointer = start;
	let pending = null;
	let finished = false;
	let error = null;
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
		if (instruction.type === "text") {
			const failure = appendOutput(context, "text", instruction.text);
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
function startCattca(program) {
	if (program.error) return errorState(program.error);
	return runProgram(program, createContext(program, {}, [], []), 0);
}
function chooseCattca(program, state, index) {
	const pending = state.pending;
	if (!pending || pending.kind !== "choice") return state;
	const context = createContext(program, { ...state.variables }, [...state.output], [...state.logs]);
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
	const command = selected && selected.type === "command" && selected.command.kind === "inputCase" ? selected.command.options[index]?.command : void 0;
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
function submitCattcaText(program, state, value) {
	const pending = state.pending;
	if (!pending || pending.kind !== "text") return state;
	const context = createContext(program, { ...state.variables }, [...state.output], [...state.logs]);
	context.vars[pending.variable] = value.slice(0, CATTCA_LIMITS.inputLength);
	return runProgram(program, context, pending.instruction + 1);
}
function restartCattca(program) {
	return startCattca(program);
}
// src/components.tsx
/** Component CSS as text; the build inlines it for the SSR harness. */
var componentCss = component_default;
function readScript(context) {
	const items = context.children.items();
	const code = items.find((item) => item.kind === "code" && item.format === "cattca") ?? items.find((item) => item.kind === "code");
	if (code && code.text.trim()) return code.text;
	return context.children.text();
}
function clampHeight(context) {
	const raw = context.props.height;
	return Math.max(200, Math.min(900, Math.round(typeof raw === "number" && Number.isFinite(raw) ? raw : 420)));
}
function readLabel(context) {
	const raw = context.props.label;
	if (typeof raw === "string" && raw.trim()) return raw.trim();
	return context.locale.t("Interactive story", "互动小说");
}
function statusText(context, state) {
	const t = context.locale.t;
	if (state.error) return t("Error", "出错");
	if (state.pending?.kind === "choice") return t("Choose an option", "请选择");
	if (state.pending?.kind === "text") return t("Waiting for input", "等待输入");
	if (state.finished) return t("Finished", "已结束");
	return t("Ready", "进行中");
}
function CattcaView(context) {
	const source = readScript(context);
	const program = useMemo(() => compileCattca(source), [source]);
	const initialState = useMemo(() => startCattca(program), [program]);
	const [state, setState] = useState(initialState);
	const [draft, setDraft] = useState("");
	const inputId = useId();
	const transcriptRef = useRef(null);
	const programRef = useRef(program);
	const resetRef = useRef(context.resetToken);
	const previousOutputRef = useRef(state.output.length);
	useEffect(() => {
		if (programRef.current === program) return;
		programRef.current = program;
		setState(startCattca(program));
		setDraft("");
	}, [program]);
	useEffect(() => {
		if (resetRef.current === context.resetToken) return;
		resetRef.current = context.resetToken;
		setState(startCattca(program));
		setDraft("");
	}, [context.resetToken, program]);
	useEffect(() => {
		const element = transcriptRef.current;
		if (element && state.output.length > previousOutputRef.current) element.scrollTop = element.scrollHeight;
		previousOutputRef.current = state.output.length;
	}, [state.output.length]);
	const label = readLabel(context);
	const height = clampHeight(context);
	const debug = context.props.debug === true;
	const locked = context.disabled || !context.visible;
	const style = { "--rmd-cattca-height": `${height}px` };
	const phase = state.error ? "error" : state.pending?.kind === "choice" ? "choice" : state.pending?.kind === "text" ? "input" : state.finished ? "finished" : "ready";
	const choose = (index) => {
		if (context.mode === "static" || locked) return;
		setState((previous) => chooseCattca(program, previous, index));
	};
	const submit = (event) => {
		event.preventDefault();
		if (context.mode === "static" || locked) return;
		setState((previous) => submitCattcaText(program, previous, draft));
		setDraft("");
	};
	const restart = () => {
		if (context.mode === "static" || locked) return;
		context.runtime.reset(context.content);
		setState(startCattca(program));
		setDraft("");
	};
	if (!source.trim()) return /* @__PURE__ */ jsxs("section", {
		className: "rmd-cattca",
		"data-cattca": true,
		"data-cattca-state": "missing",
		style,
		children: [/* @__PURE__ */ jsx("header", {
			className: "rmd-cattca-head",
			children: /* @__PURE__ */ jsxs("div", {
				className: "rmd-cattca-heading",
				children: [/* @__PURE__ */ jsx("span", {
					className: "rmd-cattca-title",
					children: label
				}), /* @__PURE__ */ jsx("span", {
					className: "rmd-cattca-status",
					children: context.locale.t("Missing script", "缺少剧本")
				})]
			})
		}), /* @__PURE__ */ jsx("p", {
			className: "rmd-cattca-error",
			role: "alert",
			children: context.locale.t("Add a fenced code block tagged cattca inside this component.", "请在组件内添加一个标记为 cattca 的代码围栏来编写剧本。")
		})]
	});
	return /* @__PURE__ */ jsxs("section", {
		className: "rmd-cattca",
		"data-cattca": true,
		"data-cattca-state": phase,
		style,
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "rmd-cattca-head",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rmd-cattca-heading",
					children: [/* @__PURE__ */ jsx("span", {
						className: "rmd-cattca-title",
						children: label
					}), /* @__PURE__ */ jsx("span", {
						className: "rmd-cattca-status",
						children: statusText(context, state)
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "rmd-cattca-action",
					"data-cattca-restart": true,
					disabled: locked,
					onClick: restart,
					children: context.locale.t("Restart", "重新开始")
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rmd-cattca-transcript",
				ref: transcriptRef,
				role: "log",
				"aria-live": "polite",
				"aria-label": context.locale.t("Story transcript", "故事正文"),
				tabIndex: 0,
				children: [state.output.map((entry) => /* @__PURE__ */ jsx("div", {
					className: "rmd-cattca-line",
					"data-cattca-line": entry.kind,
					children: entry.text
				}, entry.id)), state.error ? /* @__PURE__ */ jsx("p", {
					className: "rmd-cattca-error",
					role: "alert",
					children: state.error
				}) : null]
			}),
			state.pending?.kind === "choice" ? /* @__PURE__ */ jsx("div", {
				className: "rmd-cattca-choices",
				role: "group",
				"aria-label": context.locale.t("Choices", "选择"),
				children: state.pending.options.map((option) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "rmd-cattca-choice",
					"data-cattca-choice": option.index,
					disabled: locked,
					onClick: () => choose(option.index),
					children: option.label
				}, option.index))
			}) : null,
			state.pending?.kind === "text" ? /* @__PURE__ */ jsxs("form", {
				className: "rmd-cattca-form",
				onSubmit: submit,
				children: [/* @__PURE__ */ jsxs("label", {
					className: "rmd-cattca-label",
					htmlFor: inputId,
					children: [
						context.locale.t("Enter a value for", "请输入"),
						" ",
						/* @__PURE__ */ jsx("code", { children: state.pending.variable })
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rmd-cattca-input-row",
					children: [/* @__PURE__ */ jsx("input", {
						id: inputId,
						className: "rmd-cattca-input",
						"data-cattca-input": true,
						value: draft,
						disabled: locked,
						maxLength: CATTCA_LIMITS.inputLength,
						autoComplete: "off",
						onChange: (event) => setDraft(event.target.value)
					}), /* @__PURE__ */ jsx("button", {
						type: "submit",
						className: "rmd-cattca-submit",
						disabled: locked,
						children: context.locale.t("Continue", "继续")
					})]
				})]
			}) : null,
			state.finished && !state.error ? /* @__PURE__ */ jsx("p", {
				className: "rmd-cattca-end",
				children: context.locale.t("The end.", "故事结束。")
			}) : null,
			debug ? /* @__PURE__ */ jsxs("details", {
				className: "rmd-cattca-debug",
				children: [
					/* @__PURE__ */ jsx("summary", { children: context.locale.t("Interpreter state", "解释器状态") }),
					Object.keys(state.variables).length > 0 ? /* @__PURE__ */ jsx("dl", { children: Object.entries(state.variables).map(([name, value]) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", { children: name }), /* @__PURE__ */ jsx("dd", { children: String(value) })] }, name)) }) : /* @__PURE__ */ jsx("p", { children: context.locale.t("No variables.", "暂无变量。") }),
					state.logs.length > 0 ? /* @__PURE__ */ jsx("ol", { children: state.logs.map((log, index) => /* @__PURE__ */ jsx("li", { children: log }, index)) }) : /* @__PURE__ */ jsx("p", { children: context.locale.t("No logs.", "暂无日志。") })
				]
			}) : null
		]
	});
}
var cattcaPackage = defineReactComponentPackage({
	...cattca,
	css: component_default,
	render: CattcaView
});
var cattcaHost = createReactHost({ packages: [cattcaPackage] });
var cattcaImplementation = cattcaPackage.components[0];
var config = cattcaHost.config;
var reactConfig = cattcaHost.reactConfig;
// src/sample.ts
/** The sample document shipped with the package. */
var source = "# Cattca interactive story sample\n\n<checkbox bind=\"show\" label=\"Show story\" initial=\"true\">\n<checkbox bind=\"lock\" label=\"Lock story\">\n<checkbox bind=\"debug\" label=\"Show debug state\">\n\n<if when=\"{{ show }}\">\n\n<panel title=\"Cattca story\">\n\n<cattca label=\"床与晨光\" height=\"460\" disabled=\"{{ lock }}\" debug=\"{{ debug }}\">\n\n```cattca\n你叫莱莉菥。\n现在是早上六点，你醒了。\n你躺在床上，窗帘缝里漏进一线灰白的光。\n\n</let 赖床次数 = 0; label 故事开始;/>\n你要怎么做？\n</input case 选择:\n  '继续睡觉' -> goto 睡觉:\n  '起床' -> goto 起床;\n/>\n\n</label 睡觉; set 赖床次数 = 赖床次数 + 1;\napply \"这是第 \" + 赖床次数 + \" 次赖床。\";\nif 赖床次数 > 2 -> goto 睡过头/>\n你翻了个身，被子把你裹得更紧了一些。\n</goto 故事开始;/>\n</label 睡过头/>\n结局：你终于睡过了头。\n再醒来时，阳光已经铺满了整张床。\n</exit/>\n\n</label 起床/>\n</apply \"你选择了：\" + 选择 + \"。\";/>\n又是阳光明媚的一天。\n你掀开被子，脚落到地板上，凉意清醒地从脚心爬上来。\n拉开窗帘的那一下，整个房间忽然亮了一格。\n\n</input case 起床后:\n  '在窗前站一会儿' -> goto 窗前:\n  '去厨房泡一杯茶' -> goto 泡茶:\n  '翻开昨晚没读完的书' -> goto 读书;\n/>\n\n</label 窗前/>\n窗台上的风轻轻撞进来，把窗帘吹起一个弧度。\n你看见远处屋顶上镶着一层金色的边。\n</goto 起床之后/>\n\n</label 泡茶/>\n水壶开始发出细小的声响。\n茶叶在杯底慢慢舒展开，像一群刚醒来的小鱼。\n</goto 起床之后/>\n\n</label 读书/>\n书页还停在你昨夜读到的那一行。\n晨光落在纸上，字句忽然比昨晚温柔了一些。\n</goto 起床之后/>\n\n</label 起床之后/>\n接下来，你想怎么度过这个早晨？\n</input case:\n  '出门，走进这一天' -> goto 出门:\n  '留在屋里，把安静过完' -> goto 留在屋里;\n/>\n\n</label 出门/>\n你换好鞋，推门出去。\n楼道里有邻居家早餐的味道，街角的树把影子铺在人行道上。\n你踩过去，影子碎了一下，又慢慢合拢。\n\n> 又是阳光明媚的一天。你决定把它好好用掉。\n</exit/>\n\n</label 留在屋里/>\n你没有出门。房间继续安静，光从地板的一端慢慢挪到另一端。\n你什么也没错过，只是把这一小段早晨完整地留给了自己。\n\n> 又是阳光明媚的一天。你决定先不急着去哪里。\n</exit/>\n```\n\n</cattca>\n\n</panel>\n\n</if>\n";
export { CATTCA_LIMITS, CattcaView, cattca, cattcaImplementation, cattcaPackage, chooseCattca, compileCattca, componentCss, config, evaluateCattcaExpression, reactConfig, restartCattca, source, startCattca, submitCattcaText };
