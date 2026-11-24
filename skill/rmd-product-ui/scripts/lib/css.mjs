function stripComments(source) {
  let output = '';
  let quote = null;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quote) {
      output += char;
      if (char === '\\') {
        output += source[index + 1] ?? '';
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      output += char;
      continue;
    }
    if (char === '/' && next === '*') {
      output += '  ';
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        output += source[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      if (index < source.length) {
        output += '  ';
        index += 1;
      }
      continue;
    }
    output += char;
  }
  return output;
}

function createNode(type, prelude, start, parent) {
  return {
    type,
    prelude,
    start,
    end: start,
    parent,
    declarations: [],
    children: [],
  };
}

function flushDeclaration(stack, buffer, line) {
  const chunk = buffer.trim();
  if (!chunk || chunk.startsWith('@')) return;
  const colon = chunk.indexOf(':');
  if (colon <= 0) return;
  const prop = chunk.slice(0, colon).trim();
  let value = chunk.slice(colon + 1).trim();
  if (!prop || !value) return;
  let important = false;
  if (/!\s*important\s*$/i.test(value)) {
    important = true;
    value = value.replace(/!\s*important\s*$/i, '').trim();
  }
  stack[stack.length - 1].declarations.push({ prop, value, important, line });
}

/**
 * Tolerant CSS scanner. It is not a full CSS parser, but it preserves scripts,
 * at-rule context, selector context and declaration line numbers well enough
 * for design audits.
 */
export function parseCss(source) {
  const text = stripComments(source);
  const root = createNode('root', '', 1, null);
  const stack = [root];
  let buffer = '';
  let bufferLine = 1;
  let line = 1;
  let quote = null;
  let parentheses = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '\n') line += 1;

    if (quote) {
      buffer += char;
      if (char === '\\') {
        buffer += text[index + 1] ?? '';
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      if (!buffer.trim()) bufferLine = line;
      buffer += char;
      continue;
    }

    if (char === '(') {
      parentheses += 1;
      if (!buffer.trim()) bufferLine = line;
      buffer += char;
      continue;
    }

    if (char === ')') {
      parentheses = Math.max(0, parentheses - 1);
      buffer += char;
      continue;
    }

    if (parentheses === 0 && char === '{') {
      const prelude = buffer.trim();
      if (prelude) {
        const type = prelude.startsWith('@') ? 'atrule' : 'rule';
        const node = createNode(type, prelude, bufferLine, stack[stack.length - 1]);
        stack[stack.length - 1].children.push(node);
        stack.push(node);
      }
      buffer = '';
      bufferLine = line;
      continue;
    }

    if (parentheses === 0 && char === ';') {
      flushDeclaration(stack, buffer, bufferLine);
      buffer = '';
      bufferLine = line;
      continue;
    }

    if (parentheses === 0 && char === '}') {
      flushDeclaration(stack, buffer, bufferLine);
      if (stack.length > 1) {
        stack[stack.length - 1].end = line;
        stack.pop();
      }
      buffer = '';
      bufferLine = line;
      continue;
    }

    if (!buffer.trim() && !/\s/.test(char)) bufferLine = line;
    buffer += char;
  }

  flushDeclaration(stack, buffer, bufferLine);
  while (stack.length > 1) {
    stack[stack.length - 1].end = line;
    stack.pop();
  }
  root.end = line;
  return root;
}

export function walkCss(root, visitor) {
  const visit = (node, ancestors) => {
    const nextAncestors = [...ancestors, node];
    for (const declaration of node.declarations) {
      visitor(declaration, node, nextAncestors);
    }
    for (const child of node.children) visit(child, nextAncestors);
  };
  visit(root, []);
}

export function atRuleContext(ancestors) {
  return ancestors
    .filter((node) => node.type === 'atrule')
    .map((node) => node.prelude)
    .join(' ');
}

export function inAtRule(ancestors, pattern) {
  return ancestors.some((node) => node.type === 'atrule' && pattern.test(node.prelude));
}

export function selectorContext(node) {
  const parts = [];
  let current = node;
  while (current && current.type !== 'root') {
    if (current.type === 'rule') parts.unshift(current.prelude);
    current = current.parent;
  }
  return parts.join(' ');
}

export function nearestRule(node) {
  let current = node;
  while (current && current.type !== 'root') {
    if (current.type === 'rule') return current;
    current = current.parent;
  }
  return null;
}

export function declarationText(declaration) {
  return `${declaration.prop}: ${declaration.value}`;
}