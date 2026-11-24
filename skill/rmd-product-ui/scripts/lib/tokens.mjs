import { readFileSync } from 'node:fs';

const DEFAULT_TOKENS_URL = new URL('../../assets/tokens.json', import.meta.url);

export const TYPE_ROLES = Object.freeze([
  { name: 'display', size: '2xl', weight: 'bold', leading: 'tight', tracking: 'display' },
  { name: 'title-1', size: 'xl', weight: 'bold', leading: 'tight', tracking: 'display' },
  { name: 'title-2', size: 'lg', weight: 'bold', leading: 'tight', tracking: 'display' },
  { name: 'title-3', size: 'md', weight: 'bold', leading: 'tight', tracking: 'display' },
  { name: 'title-4', size: 'h5', weight: 'bold', leading: 'tight', tracking: 'display', color: 'ink-soft' },
  { name: 'title-5', size: 'h6', weight: 'bold', leading: 'tight', tracking: 'display', color: 'ink-soft' },
  { name: 'block-title', size: 'block-title', weight: 'semibold', leading: 'snug', tracking: 'title' },
  { name: 'block-subtitle', size: 'block-subtitle', weight: 'semibold', leading: 'snug', tracking: 'title' },
  { name: 'body', size: 'md', weight: 'regular', leading: 'relaxed' },
  { name: 'body-sm', size: 'sm', weight: 'regular', leading: 'normal' },
  { name: 'label', size: 'sm', weight: 'semibold', leading: 'tight' },
  { name: 'label-medium', size: 'sm', weight: 'medium', leading: 'tight' },
  { name: 'meta', size: 'xs', weight: 'regular', leading: 'normal' },
  { name: 'overline', size: 'xs', weight: 'semibold', leading: 'snug', tracking: 'overline', transform: 'uppercase' },
  { name: 'code', size: 'sm', weight: 'regular', leading: 'normal', font: 'mono' },
  { name: 'numeric', size: 'sm', weight: 'semibold', leading: 'tight', numeric: 'tabular-nums' },
]);

export function loadTokens(file = DEFAULT_TOKENS_URL) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function normalizePrefix(prefix = 'ui') {
  return String(prefix ?? 'ui')
    .trim()
    .replace(/^--/, '')
    .replace(/-+$/, '');
}

export function cssVar(name, prefix = 'ui') {
  const clean = normalizePrefix(prefix);
  return clean ? `--${clean}-${name}` : `--${name}`;
}

const STATIC_GROUPS = Object.freeze([
  ['font', 'font'],
  ['type', 'text'],
  ['weight', 'weight'],
  ['leading', 'leading'],
  ['tracking', 'tracking'],
  ['space', 'space'],
  ['rhythm', 'rhythm'],
  ['radius', 'radius'],
  ['control', 'control'],
  ['field', 'field'],
  ['table', 'table'],
  ['motion', 'motion'],
  ['ease', 'ease'],
]);

function staticEntries(tokens) {
  const entries = [];
  for (const [group, cssPrefix] of STATIC_GROUPS) {
    for (const [key, value] of Object.entries(tokens[group] ?? {})) {
      entries.push([`${cssPrefix}-${key}`, value]);
    }
  }
  return entries;
}

function modeEntries(tokens, mode, includeComponentStatic = false) {
  const entries = [];
  for (const [key, value] of Object.entries(tokens.color[mode] ?? {})) {
    entries.push([key, value]);
  }
  for (const [key, value] of Object.entries(tokens.shadow[mode] ?? {})) {
    entries.push([`shadow-${key}`, value]);
  }
  if (includeComponentStatic) {
    for (const [key, value] of Object.entries(tokens.component.static ?? {})) {
      entries.push([key, value]);
    }
  }
  for (const [key, value] of Object.entries(tokens.component[mode] ?? {})) {
    entries.push([key, value]);
  }
  return entries;
}

function declarationLines(entries, prefix, indent = '  ') {
  return entries.map(([name, value]) => `${indent}${cssVar(name, prefix)}: ${value};`);
}

function darkBlock(selector, tokens, prefix) {
  const entries = modeEntries(tokens, 'dark');
  return [
    `${selector} {`,
    '  color-scheme: dark;',
    ...declarationLines(entries, prefix),
    '}',
  ];
}

function densityBlocks(tokens, prefix) {
  const blocks = [];
  for (const mode of ['compact', 'comfortable']) {
    const values = tokens.density?.[mode];
    if (!values) continue;
    const entries = Object.entries(values);
    blocks.push(`[data-density="${mode}"] {`);
    for (const [name, value] of entries) {
      blocks.push(`  ${cssVar(name, prefix)}: ${value};`);
    }
    blocks.push('}');
  }
  return blocks;
}

function utilityBlocks(prefix) {
  const classPrefix = normalizePrefix(prefix) || 'ui';
  const lines = [];
  for (const role of TYPE_ROLES) {
    const declarations = [
      `font-size: var(${cssVar(`text-${role.size}`, prefix)});`,
      `font-weight: var(${cssVar(`weight-${role.weight}`, prefix)});`,
      `line-height: var(${cssVar(`leading-${role.leading}`, prefix)});`,
    ];
    if (role.tracking) {
      declarations.push(`letter-spacing: var(${cssVar(`tracking-${role.tracking}`, prefix)});`);
    }
    if (role.font) {
      declarations.push(`font-family: var(${cssVar(`font-${role.font}`, prefix)});`);
    }
    if (role.color) {
      declarations.push(`color: var(${cssVar(role.color, prefix)});`);
    }
    if (role.transform) {
      declarations.push(`text-transform: ${role.transform};`);
    }
    if (role.numeric) {
      declarations.push(`font-variant-numeric: ${role.numeric};`);
    }
    lines.push(`.${classPrefix}-type-${role.name} { ${declarations.join(' ')} }`);
  }
  return lines;
}

export function emitTokenCss(tokens, options = {}) {
  const prefix = options.prefix ?? 'ui';
  const autoDark = options.autoDark !== false;
  const includeDensity = options.density !== false;
  const includeUtilities = options.utilities === true;
  const lines = [
    '/* RMD Product UI tokens. Generated from assets/tokens.json; edit the JSON, not this file. */',
    ':root {',
    '  color-scheme: light;',
    ...declarationLines(staticEntries(tokens), prefix),
    ...declarationLines(modeEntries(tokens, 'light', true), prefix),
    '}',
  ];

  if (autoDark) {
    const entries = modeEntries(tokens, 'dark');
    lines.push(
      '@media (prefers-color-scheme: dark) {',
      '  :root:not([data-theme="light"]):not([data-color-scheme="light"]) {',
      '    color-scheme: dark;',
      ...declarationLines(entries, prefix, '    '),
      '  }',
      '}',
    );
  }

  lines.push(...darkBlock('[data-theme="dark"], [data-color-scheme="dark"]', tokens, prefix));

  if (includeDensity) {
    lines.push(...densityBlocks(tokens, prefix));
  }

  if (includeUtilities) {
    lines.push(...utilityBlocks(prefix));
  }

  return `${lines.join('\n')}\n`;
}

export function emitTokenJson(tokens) {
  return `${JSON.stringify(tokens, null, 2)}\n`;
}

export function tokenSummary(tokens) {
  const staticCount = staticEntries(tokens).length;
  const lightCount = modeEntries(tokens, 'light', true).length;
  const darkCount = modeEntries(tokens, 'dark').length;
  return { staticCount, lightCount, darkCount, total: staticCount + lightCount + darkCount };
}