import { contrastGrade, contrastRatio, formatRatio } from './color.mjs';

export const DEFAULT_PAIRS = Object.freeze([
  { name: 'Body ink on surface', fg: 'ink', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Body ink on paper', fg: 'ink', bg: 'paper', min: 4.5, role: 'text' },
  { name: 'Body ink on subtle surface', fg: 'ink', bg: 'surface-subtle', min: 4.5, role: 'text' },
  { name: 'Secondary ink on surface', fg: 'ink-soft', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Secondary ink on paper', fg: 'ink-soft', bg: 'paper', min: 4.5, role: 'text' },
  { name: 'Muted ink on surface', fg: 'ink-muted', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Muted ink on paper', fg: 'ink-muted', bg: 'paper', min: 4.5, role: 'text' },
  { name: 'Muted ink on subtle surface', fg: 'ink-muted', bg: 'surface-subtle', min: 4.5, role: 'text' },
  { name: 'Accent text on surface', fg: 'accent-text', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Accent text on paper', fg: 'accent-text', bg: 'paper', min: 4.5, role: 'text' },
  { name: 'Accent text on accent soft', fg: 'accent-text', bg: 'accent-soft', min: 4.5, role: 'text' },
  { name: 'Accent ink on accent fill', fg: 'accent-ink', bg: 'accent', min: 4.5, role: 'text' },
  { name: 'Accent ink on accent hover', fg: 'accent-ink', bg: 'accent-hover', min: 4.5, role: 'text' },
  { name: 'Success on success soft', fg: 'success', bg: 'success-soft', min: 4.5, role: 'text' },
  { name: 'Success on surface', fg: 'success', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Warning on warning soft', fg: 'warning', bg: 'warning-soft', min: 4.5, role: 'text' },
  { name: 'Warning on surface', fg: 'warning', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Danger on danger soft', fg: 'danger', bg: 'danger-soft', min: 4.5, role: 'text' },
  { name: 'Danger on surface', fg: 'danger', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Tooltip ink on tooltip', fg: 'tooltip-ink', bg: 'tooltip-bg', min: 4.5, role: 'text' },
  { name: 'Code ink on code surface', fg: 'code-ink', bg: 'code-bg', min: 4.5, role: 'text' },
  { name: 'Chart axis on surface', fg: 'chart-axis', bg: 'surface', min: 4.5, role: 'text' },
  { name: 'Focus ring on surface', fg: 'focus', bg: 'surface', min: 3, role: 'non-text' },
  { name: 'Focus ring on paper', fg: 'focus', bg: 'paper', min: 3, role: 'non-text' },
  { name: 'Selected ink on selected fill', fg: 'control-selected-ink', bg: 'control-selected', min: 4.5, role: 'text' },
  { name: 'Hairline on surface', fg: 'line', bg: 'surface', min: 1.5, role: 'decorative' },
  { name: 'Strong hairline on surface', fg: 'line-strong', bg: 'surface', min: 1.5, role: 'decorative' },
  { name: 'Chart grid on surface', fg: 'chart-grid', bg: 'surface', min: 1.5, role: 'decorative' },
]);

export function checkTokenContrast(tokens, pairs = DEFAULT_PAIRS) {
  const results = [];
  for (const mode of ['light', 'dark']) {
    for (const pair of pairs) {
      const fg = tokens.color[mode]?.[pair.fg];
      const bg = tokens.color[mode]?.[pair.bg];
      if (!fg || !bg) {
        results.push({
          mode,
          ...pair,
          fg,
          bg,
          ratio: null,
          pass: false,
          grade: 'missing',
          error: `Missing token: ${!fg ? pair.fg : pair.bg}`,
        });
        continue;
      }
      try {
        const ratio = contrastRatio(fg, bg);
        results.push({
          mode,
          ...pair,
          fgToken: pair.fg,
          bgToken: pair.bg,
          fg,
          bg,
          ratio,
          pass: ratio + 1e-9 >= pair.min,
          grade: contrastGrade(ratio, pair.role === 'large'),
          error: null,
        });
      } catch (error) {
        results.push({
          mode,
          ...pair,
          fgToken: pair.fg,
          bgToken: pair.bg,
          fg,
          bg,
          ratio: null,
          pass: false,
          grade: 'error',
          error: error.message,
        });
      }
    }
  }
  return results;
}

export function summarizeContrast(results, { includeDecorative = false } = {}) {
  const visible = includeDecorative
    ? results
    : results.filter((result) => result.role !== 'decorative');
  const summary = {
    total: visible.length,
    pass: 0,
    fail: 0,
    textFail: 0,
    nonTextFail: 0,
    decorativeFail: 0,
  };
  for (const result of visible) {
    if (result.pass) summary.pass += 1;
    else {
      summary.fail += 1;
      if (result.role === 'text' || result.role === 'large') summary.textFail += 1;
      else if (result.role === 'non-text') summary.nonTextFail += 1;
      else summary.decorativeFail += 1;
    }
  }
  return summary;
}

export { formatRatio };