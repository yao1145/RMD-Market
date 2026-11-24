import { normalizeHex } from './color.mjs';
import { inAtRule, nearestRule, parseCss, selectorContext, walkCss } from './css.mjs';

const FONT_SIZES = new Set([11, 12, 14, 16, 17, 19, 23, 28]);
const FONT_WEIGHTS = new Set([400, 500, 600, 700]);
const LINE_HEIGHTS = new Set([1, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.7]);
const TRACKING = new Set([
  'normal', 'inherit', 'initial', 'unset',
  '0', '0em',
  '-0.03em', '-0.015em', '-0.01em',
  '0.01em', '0.02em',
]);
const RADII = new Set([0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 22, 999]);
const DURATIONS = new Set([0, 0.01, 100, 150, 160, 170, 180, 200, 220, 300]);
const LOOP_DURATIONS = new Set([800, 1400]);
const DELAYS = new Set([0, 40, 100]);
const STANDARD_EASING = 'cubic-bezier(0.22,0.61,0.36,1)';

const PALETTE = new Map();
function registerColor(hex, token) {
  const normalized = normalizeHex(hex);
  if (!normalized) return;
  const list = PALETTE.get(normalized) ?? [];
  if (!list.includes(token)) list.push(token);
  PALETTE.set(normalized, list);
}
const LIGHT_PALETTE = {
  paper: '#f5f3f1', surface: '#ffffff', 'surface-subtle': '#faf9f7',
  'surface-hover': '#f3f1ee', 'surface-active': '#ebe8e4',
  ink: '#111111', 'ink-soft': '#55524e', 'ink-muted': '#6f6c68',
  line: '#e6e4e3', 'line-strong': '#d6d4d2',
  accent: '#1f5ae8', 'accent-hover': '#1a4fd0', 'accent-soft': '#eef3fe',
  'accent-line': '#cad9f9', 'accent-ink': '#ffffff', 'accent-text': '#1f5ae8',
  focus: '#1f5ae8',
  success: '#18794e', 'success-soft': '#e8f5ee', 'success-line': '#bfe3cf',
  warning: '#9a6700', 'warning-soft': '#fff6dd', 'warning-line': '#f0dca8',
  danger: '#c4323f', 'danger-soft': '#fff0f1', 'danger-line': '#f3c6cb',
  'neutral-soft': '#f3f1ee',
  'tooltip-bg': '#26282c', 'tooltip-ink': '#f5f6f8',
  'control-selected': '#1f5ae8', 'control-selected-ink': '#ffffff',
  'control-track': '#eceae7', 'control-thumb': '#ffffff',
  'chart-1': '#1f5ae8', 'chart-2': '#d97757', 'chart-3': '#2f9e7e',
  'chart-4': '#b07d2b', 'chart-5': '#7a5af8', 'chart-6': '#2f8fa8',
  'chart-7': '#7f8f3a', 'chart-8': '#b45f8a',
  'chart-grid': '#eceae7', 'chart-axis': '#6f6c68',
  'code-bg': '#ffffff', 'code-bg-deep': '#ffffff', 'code-ink': '#253247',
  'code-comment': '#6a7482', 'code-keyword': '#1f5ae8', 'code-string': '#18794e',
  'code-number': '#9a6700', 'code-title': '#1a4fd0', 'code-attr': '#b0355e',
  'code-meta': '#6a4fb6', 'code-addition': '#18794e', 'code-deletion': '#c4323f',
};

const DARK_PALETTE = {
  paper: '#141517', surface: '#1c1d20', 'surface-subtle': '#232428',
  'surface-hover': '#2a2b30', 'surface-active': '#32343a',
  ink: '#f4f2ef', 'ink-soft': '#c9c6c1', 'ink-muted': '#9b9792',
  line: '#34363b', 'line-strong': '#4a4c52',
  accent: '#7aa2ff', 'accent-hover': '#9ab8ff', 'accent-soft': '#1e2a44',
  'accent-line': '#344a75', 'accent-ink': '#0b1220', 'accent-text': '#9ab8ff',
  focus: '#9ab8ff',
  success: '#6fce9f', 'success-soft': '#173326', 'success-line': '#2f5b45',
  warning: '#e8b75a', 'warning-soft': '#33270f', 'warning-line': '#5c4a22',
  danger: '#ff9aa5', 'danger-soft': '#3a1b1f', 'danger-line': '#794853',
  'chart-2': '#e59a7d', 'chart-3': '#63c7a6', 'chart-4': '#d8ab5e',
  'chart-5': '#a78bfa', 'chart-6': '#6ec3d8', 'chart-7': '#b4c46a',
  'chart-8': '#d98cb2',
  'code-bg': '#17181b', 'code-ink': '#e6e3de',
  'code-comment': '#8f9298', 'code-number': '#e8b75a',
  'code-meta': '#c4a7ff',
  'control-selected': '#7aa2ff', 'control-selected-ink': '#0b1220',
  'control-track': '#2c2e33', 'control-thumb': '#f4f2ef',
};

for (const palette of [LIGHT_PALETTE, DARK_PALETTE]) {
  for (const [token, hex] of Object.entries(palette)) registerColor(hex, token);
}

export const RULE_CATALOG = Object.freeze([
  { id: 'TYPE-001', severity: 'warning', title: 'Font size outside the 11/12/14/16/17/19/23/28 scale' },
  { id: 'TYPE-002', severity: 'info', title: 'Font weight outside 400/500/600/700' },
  { id: 'TYPE-003', severity: 'info', title: 'Line height outside the shared leading scale' },
  { id: 'TYPE-004', severity: 'info', title: 'Letter spacing outside the display/title/code/overline set' },
  { id: 'MOTION-001', severity: 'warning', title: 'Duration outside 100-300ms or the 0.8s/1.4s ambient loops' },
  { id: 'MOTION-002', severity: 'warning', title: 'Easing other than the standard curve or var(--ease-standard); linear only for loops' },
  { id: 'MOTION-003', severity: 'warning', title: 'transition: all' },
  { id: 'MOTION-004', severity: 'warning', title: 'Infinite animation without a reduced-motion guard' },
  { id: 'MOTION-005', severity: 'info', title: 'Animated declarations without a reduced-motion guard in this file' },
  { id: 'MOTION-006', severity: 'info', title: 'Press scale written with transform instead of the scale property' },
  { id: 'SHAPE-001', severity: 'warning', title: 'Radius outside 1/2/3/4/5/6/8/9/10/12/14/22/999' },
  { id: 'SHAPE-002', severity: 'info', title: 'Odd gap value; the rhythm uses even spacing steps' },
  { id: 'COLOR-001', severity: 'warning', title: 'Palette hex where a semantic token exists' },
  { id: 'A11Y-001', severity: 'warning', title: 'Outline removed without a detected focus replacement' },
  { id: 'A11Y-002', severity: 'info', title: '!important outside print, forced-colors or reduced-motion' },
]);

const DISABLE_FILE = 'rmd-ui-audit-disable-file';
const DISABLE_LINE = 'rmd-ui-audit-disable';
const DISABLE_NEXT = 'rmd-ui-audit-disable-next-line';

function pxValues(value) {
  return [...value.matchAll(/(-?\d*\.?\d+)px\b/gi)].map((match) => Number(match[1]));
}

function timeValues(value) {
  return [...value.matchAll(/(\d*\.?\d+)(ms|s)\b/gi)].map((match) => ({
    ms: Number(match[1]) * (match[2].toLowerCase() === 's' ? 1000 : 1),
    raw: match[0],
  }));
}

function simpleNumber(value) {
  const match = /^(-?\d*\.?\d+)$/.exec(value.trim());
  return match ? Number(match[1]) : null;
}

function simplePx(value) {
  const match = /^(-?\d*\.?\d+)px$/i.exec(value.trim());
  return match ? Number(match[1]) : null;
}

function selectorFor(node) {
  const rule = nearestRule(node);
  return rule ? selectorContext(rule) : node.prelude;
}

function isCustomProperty(prop) {
  return prop.startsWith('--');
}

function isPrintOrForcedColors(ancestors) {
  return inAtRule(ancestors, /^@media\s+print\b/i) || inAtRule(ancestors, /forced-colors/i);
}

function isReducedMotion(ancestors) {
  return inAtRule(ancestors, /prefers-reduced-motion/i);
}

function checkEasing(value) {
  const problems = [];
  const bezierMatches = [...value.matchAll(/cubic-bezier\(([^)]*)\)/gi)];
  for (const match of bezierMatches) {
    const normalized = `cubic-bezier(${match[1].replace(/\s+/g, '')})`;
    if (normalized !== STANDARD_EASING) problems.push(match[0]);
  }
  const withoutVars = value
    .replace(/var\([^)]*\)/gi, '')
    .replace(/cubic-bezier\([^)]*\)/gi, '');
  for (const match of withoutVars.matchAll(/\b(ease-in-out|ease-in|ease-out|ease)\b/gi)) {
    problems.push(match[0]);
  }
  return problems;
}

function hasVisibleOutlineReplacement(declarations) {
  return declarations.some((declaration) => {
    if (declaration.prop === 'box-shadow') return true;
    if (declaration.prop === 'filter' || declaration.prop === 'stroke') {
      return !/^(none|transparent|initial|unset|0)$/i.test(declaration.value.trim());
    }
    if (declaration.prop === 'border' || declaration.prop === 'border-color') return true;
    if (declaration.prop === 'outline' && !/^(none|0|0px)$/i.test(declaration.value.trim())) return true;
    if (declaration.prop === 'background' || declaration.prop === 'background-color') {
      return !/^(none|transparent|initial|unset)$/i.test(declaration.value.trim());
    }
    return false;
  });
}

function selectorTokens(selector) {
  const generic = new Set(['.md-document', '.local-document', '.reactive-md-theme']);
  const tokens = new Set();
  for (const match of selector.matchAll(/\.[A-Za-z_][\w-]*|\[[^\]]+\]/g)) {
    const token = match[0].replace(/\s+/g, '');
    if (!generic.has(token)) tokens.add(token);
  }
  return tokens;
}

function collectFocusReplacements(root) {
  const tokens = new Set();
  walkCss(root, (declaration, node) => {
    const selector = selectorFor(node);
    if (!/:focus(?:-visible)?\b|\[data-highlighted\]|\[data-state="on"\]/i.test(selector)) return;
    if (!hasVisibleOutlineReplacement(node.declarations)) return;
    for (const token of selectorTokens(selector)) tokens.add(token);
  });
  return tokens;
}

export function auditCss(source, options = {}) {
  const filename = options.filename ?? '<css>';
  const disabledRules = new Set(options.disabledRules ?? []);
  const lines = source.split(/\r?\n/);
  if (source.includes(DISABLE_FILE)) {
    return { filename, findings: [], skipped: 'file-disabled' };
  }

  const root = parseCss(source);
  const findings = [];
  const seen = new Set();
  const focusReplacementTokens = collectFocusReplacements(root);
  const hasReducedMotion = /@media[^{]*prefers-reduced-motion/i.test(source);
  const animatedDeclarations = [];
  const infiniteDeclarations = [];

  const suppressed = (lineNumber) => {
    const text = lines[lineNumber - 1] ?? '';
    const previous = lines[lineNumber - 2] ?? '';
    return text.includes(DISABLE_LINE) || previous.includes(DISABLE_NEXT);
  };

  const add = (rule, node, declaration, message, hint, severity) => {
    if (disabledRules.has(rule)) return;
    const line = declaration?.line ?? node.start ?? 1;
    if (suppressed(line)) return;
    const meta = RULE_CATALOG.find((item) => item.id === rule);
    const key = `${rule}|${line}|${declaration?.prop ?? ''}|${declaration?.value ?? ''}|${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push({
      rule,
      severity: severity ?? meta?.severity ?? 'warning',
      file: filename,
      line,
      selector: selectorFor(node),
      prop: declaration?.prop,
      value: declaration?.value,
      message,
      hint,
    });
  };

  walkCss(root, (declaration, node, ancestors) => {
    const { prop, value } = declaration;
    const selector = selectorFor(node);
    const printOrForced = isPrintOrForcedColors(ancestors);

    if (prop === 'font-size') {
      const size = simplePx(value);
      if (size !== null && !FONT_SIZES.has(size)) {
        add('TYPE-001', node, declaration,
          `font-size ${value} is off the type scale.`,
          'Use 12/14/16/17/19/23/28px, or a --text-* token.');
      }
    }

    if (prop === 'font-weight') {
      const weight = simpleNumber(value);
      if (weight !== null && !FONT_WEIGHTS.has(weight)) {
        add('TYPE-002', node, declaration,
          `font-weight ${value} is outside the 400/500/600/700 set.`,
          'Use 400 body, 500 UI/button labels, 600 titles and 700 document headings.');
      }
    }

    if (prop === 'line-height') {
      const leading = simpleNumber(value);
      if (leading !== null && !LINE_HEIGHTS.has(leading)) {
        add('TYPE-003', node, declaration,
          `line-height ${value} is outside the shared leading scale.`,
          'Use 1.25 headings, 1.45 titles, 1.6 UI/data or 1.7 document prose.');
      }
    }

    if (prop === 'letter-spacing') {
      const tracking = value.trim().toLowerCase();
      if (!tracking.includes('var(') && !tracking.includes('calc(') && !TRACKING.has(tracking)) {
        add('TYPE-004', node, declaration,
          `letter-spacing ${value} is outside the shared tracking set.`,
          'Use -0.015em display, -0.01em titles, 0 body, 0.02em code/overline.');
      }
    }

    if (prop === 'border-radius' || prop.endsWith('-radius')) {
      if (!value.includes('var(') && !value.includes('calc(')) {
        const bad = pxValues(value).filter((size) => !RADII.has(size));
        if (bad.length) {
          add('SHAPE-001', node, declaration,
            `Radius ${bad.map((size) => `${size}px`).join(', ')} is off the shape scale.`,
            'Use 8 fields, 10 buttons, 12 cards, 14 panels, 999 pills, or a --radius-* token.');
        }
      }
    }

    if (prop === 'gap' || prop === 'row-gap' || prop === 'column-gap') {
      if (!value.includes('var(') && !value.includes('calc(')) {
        const bad = pxValues(value).filter((size) => size > 1 && size % 2 !== 0);
        if (bad.length) {
          add('SHAPE-002', node, declaration,
            `Gap ${bad.map((size) => `${size}px`).join(', ')} is odd.`,
            'Use the even 4px rhythm (4/8/12/16/24/32/48).');
        }
      }
    }

    if (!isCustomProperty(prop) && !printOrForced && !value.includes('url(')) {
      const hexes = [...value.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((match) => match[0]);
      const matches = [];
      for (const hex of hexes) {
        const normalized = normalizeHex(hex);
        const tokens = normalized ? PALETTE.get(normalized) : null;
        if (tokens?.length) matches.push(`${hex} -> ${tokens.slice(0, 3).map((token) => `--${token}`).join(' / ')}`);
      }
      if (matches.length) {
        add('COLOR-001', node, declaration,
          `Raw palette color in ${prop}: ${matches.join('; ')}.`,
          'Use the semantic token so light/dark and theme overrides keep working.');
      }
    }

    if (prop === 'outline' && /^(none|0|0px)$/i.test(value.trim())) {
      const proxyFocus = [...selectorTokens(selector)].some((token) => focusReplacementTokens.has(token));
      if (!hasVisibleOutlineReplacement(node.declarations) && !proxyFocus) {
        add('A11Y-001', node, declaration,
          'outline is removed and no visible focus replacement was found for this selector.',
          'Provide a :focus-visible ring (2px focus color, 2px offset) before removing the outline.');
      }
    }

    if (declaration.important && !isPrintOrForcedColors(ancestors) && !isReducedMotion(ancestors)) {
      add('A11Y-002', node, declaration,
        '!important is used outside print, forced-colors or reduced-motion.',
      'Prefer cascade layers and scoped selectors over !important.');
    }

    if (prop === 'transform' && /scale\(/i.test(value) && /:active\b/i.test(selector)) {
      add('MOTION-006', node, declaration,
        'Press scale uses transform, which can overwrite a host or component transform.',
        'Use the scale property (scale: 0.97) for press feedback.');
    }

    const motionProp = prop === 'transition' || prop === 'animation'
      || prop === 'transition-duration' || prop === 'animation-duration'
      || prop === 'transition-delay' || prop === 'animation-delay';
    if (!motionProp) return;

    animatedDeclarations.push({ declaration, node, ancestors });
    if (prop === 'transition' && /\ball\b/i.test(value)) {
      add('MOTION-003', node, declaration,
        'transition: all animates unrelated properties and hides layout drift.',
        'Name the properties: background-color, border-color, color, box-shadow, opacity, transform/scale.');
    }

    const isInfinite = /\binfinite\b/i.test(value);
    if (isInfinite) infiniteDeclarations.push({ declaration, node });

    const times = timeValues(value);
    const allowed = prop.endsWith('-delay')
      ? DELAYS
      : new Set([...DURATIONS, ...DELAYS]);
    for (const time of times) {
      const loopAllowed = isInfinite && LOOP_DURATIONS.has(time.ms);
      if (!allowed.has(time.ms) && !loopAllowed) {
        add('MOTION-001', node, declaration,
          `Duration ${time.raw} is outside the motion scale.`,
          'Use 150ms state, 220ms structure, 300ms progress; 0.8s/1.4s only for infinite loading loops.');
      } else if (!isInfinite && prop !== 'transition-delay' && prop !== 'animation-delay' && time.ms > 300) {
        add('MOTION-001', node, declaration,
          `Duration ${time.raw} is longer than the 300ms ceiling.`,
          'Keep interaction motion at or below 300ms unless it is an infinite loading loop.');
      }
    }

    const easingProblems = checkEasing(value);
    if (/\blinear\b/i.test(value) && !isInfinite) {
      easingProblems.push('linear');
    }
    if (easingProblems.length) {
      add('MOTION-002', node, declaration,
        `Easing ${[...new Set(easingProblems)].join(', ')} is not the standard curve.`,
        'Use cubic-bezier(0.22, 0.61, 0.36, 1) or var(--ease-standard); linear only for infinite loading loops.');
    }
  });

  if (animatedDeclarations.length && !hasReducedMotion) {
    add('MOTION-005', root, animatedDeclarations[0].declaration,
      'This file animates but has no prefers-reduced-motion guard.',
      'Add a reduced-motion block that disables transitions and settles entry states.');
  }

  if (infiniteDeclarations.length && !hasReducedMotion) {
    for (const { declaration, node } of infiniteDeclarations) {
      add('MOTION-004', node, declaration,
        'Infinite animation has no reduced-motion guard in this file.',
        'Disable the animation under prefers-reduced-motion; keep the loading state visible.');
    }
  }

  return { filename, findings, skipped: null };
}

export function summarizeFindings(findings) {
  return findings.reduce(
    (summary, finding) => {
      summary.total += 1;
      summary[finding.severity] = (summary[finding.severity] ?? 0) + 1;
      return summary;
    },
    { total: 0, warning: 0, info: 0, error: 0 },
  );
}