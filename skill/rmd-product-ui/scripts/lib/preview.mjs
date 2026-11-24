import { emitTokenCss, TYPE_ROLES } from './tokens.mjs';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function swatch(tokens, key, label = key) {
  const light = tokens.color.light[key];
  const dark = tokens.color.dark[key];
  return `<div class="swatch">
    <span class="swatch-chip" style="--swatch: var(--ui-${key})" aria-hidden="true"></span>
    <code>--ui-${key}</code>
    <small>${escapeHtml(label)}</small>
    <small class="swatch-value" data-value data-light="${escapeHtml(light)}" data-dark="${escapeHtml(dark)}">${escapeHtml(light)}</small>
  </div>`;
}

function swatchGroup(tokens, title, keys) {
  return `<div class="swatch-group">
    <h3>${escapeHtml(title)}</h3>
    <div class="swatch-grid">${keys.map((key) => swatch(tokens, key)).join('')}</div>
  </div>`;
}

const SURFACE_KEYS = ['paper', 'surface', 'surface-subtle', 'surface-hover', 'surface-active', 'ink', 'ink-soft', 'ink-muted', 'line', 'line-strong'];
const ACCENT_KEYS = ['accent', 'accent-hover', 'accent-soft', 'accent-line', 'accent-ink', 'accent-text', 'focus', 'control-selected', 'control-selected-ink'];
const STATUS_KEYS = ['success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft', 'neutral-soft', 'tooltip-bg', 'tooltip-ink'];
const DATA_KEYS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-7', 'chart-8', 'chart-grid', 'chart-axis', 'code-bg', 'code-ink'];

const TYPE_SPECIMENS = [
  { role: 'display', meta: '28px / 1.25 / 700 / -0.015em', text: 'Working documents, not brochures.' },
  { role: 'title-1', meta: '23px / 1.25 / 700', text: 'A section that separates work.' },
  { role: 'title-2', meta: '19px / 1.25 / 700', text: 'A subsection inside the flow.' },
  { role: 'title-3', meta: '16px / 1.25 / 700', text: 'A small heading that still anchors.' },
  { role: 'title-4', meta: '0.83em / 1.25 / 700 / soft ink', text: 'A quiet fifth-level heading.' },
  { role: 'title-5', meta: '0.75em / 1.25 / 700 / soft ink', text: 'A quiet sixth-level heading.' },
  { role: 'block-title', meta: '17px / 1.45 / 600 / -0.01em', text: 'Card, panel and disclosure title.' },
  { role: 'body', meta: '16px / 1.7 / 400', text: 'Body copy keeps a 720px measure and a relaxed 1.7 line height. The paragraph is the main reading surface; it never competes with the controls around it.' },
  { role: 'body-sm', meta: '14px / 1.6 / 400', text: 'Secondary copy, table cells and alert bodies use one step below body.' },
  { role: 'label', meta: '14px / 1.25 / 600', text: 'Field and group label' },
  { role: 'label-medium', meta: '14px / 1.25 / 500', text: 'Button and compact action label' },
  { role: 'meta', meta: '12px / 1.6 / 400', text: 'Metadata, badges, captions and dense readouts.' },
  { role: 'overline', meta: '12px / 1.45 / 600 / 0.02em / uppercase', text: 'State · Overline' },
  { role: 'code', meta: '14px / 1.6 / mono', text: 'const surface = "paper";' },
  { role: 'numeric', meta: '14px / 1.25 / 600 / tabular-nums', text: '1,248.50 · 38 px · 220 ms' },
];

const MOTION_ROWS = [
  { name: 'fast', ms: 150, token: '--ui-motion-fast', role: 'hover, press feedback, color and border state changes' },
  { name: 'base', ms: 220, token: '--ui-motion-base', role: 'structure: overlays, disclosure height, sliding indicators' },
  { name: 'slow', ms: 300, token: '--ui-motion-slow', role: 'progress width and large layout changes' },
  { name: 'tooltip', ms: 170, token: 'role timing', role: 'tooltip enter and exit, intentionally shorter than base' },
  { name: 'feedback', ms: 160, token: 'role timing', role: 'counter pop and copy feedback' },
];

function typeRows() {
  return TYPE_SPECIMENS.map((specimen) => `<div class="spec-row">
    <div class="spec-meta"><strong>${escapeHtml(specimen.role)}</strong><br>${escapeHtml(specimen.meta)}</div>
    <p class="ui-type-${specimen.role}">${escapeHtml(specimen.text)}</p>
  </div>`).join('');
}

function spacingRows(tokens) {
  return Object.entries(tokens.space).map(([key, value]) => {
    const px = Number.parseFloat(value);
    const width = Math.min(100, px * 2);
    return `<div class="space-row">
      <code>--ui-space-${key}</code>
      <span class="space-bar" style="width: ${width}%"></span>
      <small>${escapeHtml(value)}</small>
    </div>`;
  }).join('');
}

function radiusTiles(tokens) {
  const keys = ['field', 'button', 'card', 'panel', 'field-multiline', 'pill'];
  return keys.map((key) => `<div class="radius-tile" style="border-radius: var(--ui-radius-${key})">
    <code>--ui-radius-${key}</code>
    <small>${escapeHtml(tokens.radius[key])}</small>
  </div>`).join('');
}

function shadowTiles(tokens) {
  return `<div class="shadow-grid">
    <div class="shadow-tile" style="box-shadow: var(--ui-shadow-sm)"><code>--ui-shadow-sm</code><small>hover, small lift</small></div>
    <div class="shadow-tile" style="box-shadow: var(--ui-shadow-md)"><code>--ui-shadow-md</code><small>chart tooltip, detail layer</small></div>
    <div class="shadow-tile" style="box-shadow: var(--ui-overlay-shadow)"><code>--ui-overlay-shadow</code><small>dialog, popover, menu</small></div>
    <div class="shadow-tile" style="box-shadow: var(--ui-focus-halo)"><code>--ui-focus-halo</code><small>field focus halo, 3px</small></div>
  </div>`;
}

function motionRows() {
  return MOTION_ROWS.map((row) => `<div class="motion-row" data-motion="${row.ms}">
    <div class="motion-head">
      <div><code>${escapeHtml(row.token)}</code><span class="motion-ms">${row.ms}ms</span></div>
      <button class="btn btn-small" type="button" data-play>Play</button>
    </div>
    <p class="motion-role">${escapeHtml(row.role)}</p>
    <div class="motion-track"><span class="motion-fill"></span></div>
  </div>`).join('');
}

export function renderPreview(tokens, options = {}) {
  const title = options.title ?? 'RMD Product UI — Design Language Specimen';
  const tokenCss = emitTokenCss(tokens, { prefix: 'ui', utilities: true, density: true });
  const typeRoleCount = TYPE_ROLES.length;

  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${tokenCss}
/* ------------------------------------------------------------------ base */
*, *::before, *::after { box-sizing: border-box; }
html { color-scheme: light; }
body {
  margin: 0;
  background: var(--ui-paper);
  color: var(--ui-ink);
  font-family: var(--ui-font-sans);
  font-size: var(--ui-text-md);
  line-height: var(--ui-leading-relaxed);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: var(--ui-accent-text); text-decoration: none; background-image: linear-gradient(var(--ui-accent-line), var(--ui-accent-line)); background-repeat: no-repeat; background-position: 0 100%; background-size: 0% 1px; transition: background-size 160ms var(--ui-ease-standard), color var(--ui-motion-fast) var(--ui-ease-standard); }
a:hover, a:focus-visible { color: var(--ui-accent); background-size: 100% 1px; }
a:focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 2px; border-radius: 2px; }
code, kbd, samp { font-family: var(--ui-font-mono); font-size: var(--ui-text-xs); }
.skip { position: absolute; left: -9999px; top: 8px; z-index: 100; padding: 8px 12px; border-radius: var(--ui-radius-control); background: var(--ui-surface); color: var(--ui-ink); box-shadow: var(--ui-overlay-shadow); }
.skip:focus { left: 8px; outline: 2px solid var(--ui-focus); }

/* --------------------------------------------------------------- chrome */
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: 24px;
  padding: 10px max(24px, calc((100vw - 1180px) / 2));
  background: color-mix(in srgb, var(--ui-paper) 88%, transparent);
  border-bottom: 1px solid var(--ui-line);
  backdrop-filter: blur(12px);
}
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ui-ink); font-size: var(--ui-text-sm); font-weight: 600; background: none; }
.brand-mark { display: grid; place-items: center; width: 28px; height: 28px; border-radius: var(--ui-radius-control); background: var(--ui-accent); color: var(--ui-accent-ink); font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
.brand-text { color: var(--ui-ink-soft); }
.topnav { display: flex; gap: 18px; margin-left: auto; font-size: var(--ui-text-xs); }
.topnav a { color: var(--ui-ink-muted); }
.topnav a:hover { color: var(--ui-ink); }
.theme-toggle { display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 12px; border: 1px solid var(--ui-line-strong); border-radius: var(--ui-radius-button); background: var(--ui-surface); color: var(--ui-ink); font: inherit; font-size: var(--ui-text-xs); font-weight: 600; cursor: pointer; transition: background-color var(--ui-motion-fast) var(--ui-ease-standard), border-color var(--ui-motion-fast) var(--ui-ease-standard), box-shadow var(--ui-motion-fast) var(--ui-ease-standard); scale: 1; }
.theme-toggle:hover { background: var(--ui-surface-hover); box-shadow: var(--ui-shadow-sm); }
.theme-toggle:active { scale: var(--ui-press-scale); background: var(--ui-surface-active); }
.theme-toggle:focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
.theme-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ui-accent); }

/* ------------------------------------------------------------------ page */
.page { width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding: 56px 0 96px; }
.hero { padding: 40px 0 48px; border-bottom: 1px solid var(--ui-line); }
.eyebrow { margin: 0 0 14px; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
.hero h1 { max-width: 900px; margin: 0 0 18px; font-size: var(--ui-text-2xl); font-weight: var(--ui-weight-bold); line-height: var(--ui-leading-tight); letter-spacing: var(--ui-tracking-display); }
.lede { max-width: 720px; margin: 0; color: var(--ui-ink-soft); font-size: var(--ui-text-lg); line-height: var(--ui-leading-normal); }
.hero-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 0; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 24px; }
.section { padding: 48px 0; border-bottom: 1px solid var(--ui-line); }
.section:last-child { border-bottom: 0; }
.section-head { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 32px; margin-bottom: 28px; }
.section-head h2 { margin: 0; font-size: var(--ui-text-xl); font-weight: var(--ui-weight-bold); line-height: var(--ui-leading-tight); letter-spacing: var(--ui-tracking-display); }
.section-head p { max-width: 64ch; margin: 0; color: var(--ui-ink-soft); font-size: var(--ui-text-sm); line-height: var(--ui-leading-normal); }
.section-head .section-note { margin-top: 8px; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); }
.subgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.subhead { margin: 0 0 12px; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }

/* ------------------------------------------------------------------ type */
.spec-list { border-top: 1px solid var(--ui-line); }
.spec-row { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 32px; align-items: baseline; padding: 18px 0; border-bottom: 1px solid var(--ui-line); }
.spec-meta { color: var(--ui-ink-muted); font-size: var(--ui-text-xs); line-height: var(--ui-leading-snug); }
.spec-meta strong { color: var(--ui-ink); font-weight: 600; }
.spec-row p { min-width: 0; margin: 0; }

/* ----------------------------------------------------------------- color */
.swatch-group + .swatch-group { margin-top: 24px; }
.swatch-group h3 { margin: 0 0 10px; color: var(--ui-ink-soft); font-size: var(--ui-text-xs); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
.swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.swatch { display: flex; flex-direction: column; gap: 2px; padding: 10px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-card); background: var(--ui-surface); }
.swatch-chip { display: block; height: 38px; margin-bottom: 6px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-control); background: var(--swatch); }
.swatch code { color: var(--ui-ink); font-size: 11px; }
.swatch small { color: var(--ui-ink-muted); font-size: 11px; }
.swatch-value { font-variant-numeric: tabular-nums; }

/* ----------------------------------------------------------------- shape */
.space-list { display: grid; gap: 6px; }
.space-row { display: grid; grid-template-columns: 110px minmax(0, 1fr) 48px; align-items: center; gap: 12px; min-height: 24px; }
.space-row code { color: var(--ui-ink-soft); }
.space-row small { color: var(--ui-ink-muted); text-align: right; font-size: var(--ui-text-xs); font-variant-numeric: tabular-nums; }
.space-bar { display: block; height: 10px; border-radius: var(--ui-radius-2xs); background: var(--ui-accent); opacity: 0.78; }
.radius-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.radius-tile { display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; min-height: 104px; padding: 12px; overflow: hidden; border: 1px solid var(--ui-line); background: var(--ui-surface-subtle); }
.radius-tile code { color: var(--ui-ink); font-size: 11px; }
.radius-tile small { color: var(--ui-ink-muted); font-size: 11px; }
.shadow-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
.shadow-tile { display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; min-height: 110px; padding: 14px; border-radius: var(--ui-radius-card); background: var(--ui-surface); }
.shadow-tile code { color: var(--ui-ink); font-size: 11px; }
.shadow-tile small { color: var(--ui-ink-muted); font-size: 11px; }

/* ---------------------------------------------------------------- motion */
.motion-list { display: grid; gap: 10px; }
.motion-row { padding: 14px 16px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-card); background: var(--ui-surface); }
.motion-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.motion-head code { color: var(--ui-ink); }
.motion-ms { margin-left: 8px; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); font-variant-numeric: tabular-nums; }
.motion-role { margin: 4px 0 0; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); }
.motion-track { height: 8px; margin-top: 12px; overflow: hidden; border-radius: var(--ui-radius-pill); background: var(--ui-surface-active); }
.motion-fill { display: block; width: 0; height: 100%; border-radius: inherit; background: var(--ui-accent); }

/* ------------------------------------------------------------ components */
.demo-panel { padding: 24px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-panel); background: var(--ui-surface); }
.demo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 32px; }
.demo { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.demo-label { margin: 0; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: var(--ui-control-height); padding: var(--ui-control-padding-y) var(--ui-control-inset-x); border: 1px solid var(--ui-line); border-radius: var(--ui-radius-button); background: var(--ui-surface); color: var(--ui-ink); font: inherit; font-size: var(--ui-text-sm); font-weight: var(--ui-weight-medium); line-height: var(--ui-leading-tight); cursor: pointer; scale: 1; transition: background-color var(--ui-motion-fast) var(--ui-ease-standard), border-color var(--ui-motion-fast) var(--ui-ease-standard), color var(--ui-motion-fast) var(--ui-ease-standard), box-shadow var(--ui-motion-fast) var(--ui-ease-standard), scale var(--ui-motion-fast) var(--ui-ease-standard); }
.btn:hover { background: var(--ui-surface-hover); box-shadow: var(--ui-shadow-sm); }
.btn:active { scale: var(--ui-press-scale); background: var(--ui-surface-active); }
.btn:focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
.btn-primary { border-color: transparent; background: var(--ui-accent); color: var(--ui-accent-ink); }
.btn-primary:hover { background: var(--ui-accent-hover); }
.btn-primary:active { background: var(--ui-accent-hover); box-shadow: var(--ui-button-press-shadow); }
.btn-quiet { border-color: transparent; background: transparent; color: var(--ui-accent-text); }
.btn-quiet:hover { background: var(--ui-surface-hover); color: var(--ui-ink); }
.btn-quiet:active { background: var(--ui-surface-active); color: var(--ui-ink); }
.btn-small { min-height: 30px; padding: 0 12px; font-size: var(--ui-text-xs); }
.btn:disabled, .btn[aria-disabled="true"] { opacity: var(--ui-control-disabled-opacity); cursor: not-allowed; }
.inline-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.badge { display: inline-flex; align-items: center; gap: 4px; min-height: 24px; padding: 1px 10px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-pill); background: var(--ui-surface-subtle); color: var(--ui-ink-soft); font-size: var(--ui-text-xs); font-weight: 600; line-height: var(--ui-leading-normal); white-space: nowrap; }
.badge-info { border-color: var(--ui-accent-line); background: var(--ui-accent-soft); color: var(--ui-accent-text); }
.badge-success { border-color: var(--ui-success-line); background: var(--ui-success-soft); color: var(--ui-success); }
.badge-warning { border-color: var(--ui-warning-line); background: var(--ui-warning-soft); color: var(--ui-warning); }
.badge-danger { border-color: var(--ui-danger-line); background: var(--ui-danger-soft); color: var(--ui-danger); }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field > span { color: var(--ui-ink); font-size: var(--ui-text-sm); font-weight: 600; line-height: var(--ui-leading-tight); }
.field > small { color: var(--ui-ink-muted); font-size: var(--ui-text-xs); }
.input, .select, .textarea { width: 100%; min-height: var(--ui-control-height); padding: 0 12px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-field); background: var(--ui-surface); color: var(--ui-ink); font: inherit; font-size: var(--ui-text-md); transition: border-color var(--ui-motion-fast) var(--ui-ease-standard), background-color var(--ui-motion-fast) var(--ui-ease-standard), box-shadow var(--ui-motion-fast) var(--ui-ease-standard); }
.textarea { min-height: 84px; padding: 10px 12px; resize: vertical; }
.input:hover, .select:hover, .textarea:hover { border-color: var(--ui-line-strong); }
.input:focus-visible, .select:focus-visible, .textarea:focus-visible { outline: none; border: 2px solid var(--ui-accent); box-shadow: var(--ui-focus-halo); }
.input[aria-invalid="true"] { border-color: var(--ui-danger); }
.input[aria-invalid="true"]:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-danger) 20%, transparent); }
.input:disabled, .select:disabled, .textarea:disabled { background: var(--ui-surface-subtle); color: var(--ui-ink-muted); opacity: var(--ui-control-disabled-opacity); cursor: not-allowed; }
.switch-row, .check-row { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 4px; border-radius: var(--ui-radius-control); color: var(--ui-ink); font-size: var(--ui-text-sm); cursor: pointer; }
.switch-row:hover, .check-row:hover { background: var(--ui-surface-hover); }
.switch { appearance: none; -webkit-appearance: none; flex: 0 0 auto; width: 42px; height: 24px; margin: 0; border: 1px solid var(--ui-line-strong); border-radius: var(--ui-radius-pill); background-color: var(--ui-control-track); background-image: radial-gradient(ellipse 50% 50% at center, var(--ui-control-thumb) 0 80%, var(--ui-line-strong) 85% 90%, transparent 95%); background-repeat: no-repeat; background-size: 20px 20px; background-position: left 2px center; cursor: pointer; transition: background-color var(--ui-motion-fast) var(--ui-ease-standard), background-position var(--ui-motion-base) var(--ui-ease-standard), background-size var(--ui-motion-base) var(--ui-ease-standard), border-color var(--ui-motion-fast) var(--ui-ease-standard), box-shadow var(--ui-motion-fast) var(--ui-ease-standard); }
.switch:checked { border-color: transparent; background-color: var(--ui-control-selected); background-image: radial-gradient(ellipse 50% 50% at center, var(--ui-control-selected-ink) 0 90%, transparent 95%); background-position: right 2px center; }
.switch:active { background-size: 26px 20px; }
.switch:focus-visible { outline: none; box-shadow: var(--ui-focus-halo); }
.check { appearance: auto; width: 18px; height: 18px; margin: 0; accent-color: var(--ui-control-selected); }
.segmented { --seg-index: 0; --seg-count: 3; position: relative; display: grid; grid-template-columns: repeat(var(--seg-count), minmax(0, 1fr)); width: 100%; max-width: 420px; padding: 4px; border: 1px solid var(--ui-line); border-radius: var(--ui-radius-button); background: var(--ui-segmented-track); }
.segmented::before { content: ""; position: absolute; inset-block: 4px; left: 0; width: calc(100% / var(--seg-count)); border: 1px solid var(--ui-accent-line); border-radius: var(--ui-radius-control); background: var(--ui-segmented-thumb); box-shadow: var(--ui-shadow-sm); transform: translateX(calc(var(--seg-index) * 100%)); transition: transform var(--ui-motion-base) var(--ui-ease-standard), background-color var(--ui-motion-fast) var(--ui-ease-standard), box-shadow var(--ui-motion-fast) var(--ui-ease-standard); pointer-events: none; }
.segmented button { position: relative; z-index: 1; min-height: 32px; padding: 0 8px; border: 0; border-radius: var(--ui-radius-control); background: transparent; color: var(--ui-ink-soft); font: inherit; font-size: var(--ui-text-sm); font-weight: 600; cursor: pointer; transition: color var(--ui-motion-base) var(--ui-ease-standard), background-color var(--ui-motion-fast) var(--ui-ease-standard), scale var(--ui-motion-fast) var(--ui-ease-standard); }
.segmented button:hover { background: color-mix(in srgb, var(--ui-surface-hover) 72%, transparent); color: var(--ui-ink); }
.segmented button:active { scale: var(--ui-press-scale); }
.segmented button[aria-pressed="true"] { color: var(--ui-accent-text); }
.segmented button:focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
.tabs { --tab-index: 0; --tab-count: 3; position: relative; display: grid; grid-template-columns: repeat(var(--tab-count), minmax(0, 1fr)); border-bottom: 1px solid var(--ui-line); }
.tabs::after { content: ""; position: absolute; bottom: 0; left: calc(var(--tab-index) * 100% / var(--tab-count)); width: calc(100% / var(--tab-count)); height: 3px; border-radius: var(--ui-radius-xs) var(--ui-radius-xs) 0 0; background: var(--ui-accent); transition: left var(--ui-motion-base) var(--ui-ease-standard); }
.tabs button { min-height: 40px; padding: 0 8px; border: 0; border-radius: var(--ui-radius-control) var(--ui-radius-control) 0 0; background: transparent; color: var(--ui-ink-muted); font: inherit; font-size: var(--ui-text-sm); font-weight: 500; cursor: pointer; transition: background-color var(--ui-motion-fast) var(--ui-ease-standard), color var(--ui-motion-fast) var(--ui-ease-standard); }
.tabs button:hover { background: var(--ui-surface-hover); color: var(--ui-ink); }
.tabs button[aria-selected="true"] { color: var(--ui-accent-text); font-weight: 600; }
.tabs button:focus-visible { outline: 2px solid var(--ui-focus); outline-offset: -3px; }
.tabpanel { padding: 14px 2px 2px; color: var(--ui-ink-soft); font-size: var(--ui-text-sm); }
.tabpanel[hidden] { display: none; }
.tabpanel { transition: opacity var(--ui-motion-base) var(--ui-ease-standard), transform var(--ui-motion-base) var(--ui-ease-standard); }
@starting-style { .tabpanel:not([hidden]) { opacity: 0; transform: translateY(4px); } }
.accordion { border-top: 1px solid var(--ui-line); }
.acc-item { border-bottom: 1px solid var(--ui-line); }
.acc-trigger { display: flex; align-items: center; justify-content: space-between; gap: 24px; width: 100%; min-height: 44px; padding: 10px 0; border: 0; background: transparent; color: var(--ui-ink); font: inherit; font-size: var(--ui-text-md); font-weight: 500; line-height: 1.4; text-align: left; cursor: pointer; transition: color var(--ui-motion-fast) var(--ui-ease-standard); }
.acc-trigger:hover { color: var(--ui-ink-soft); }
.acc-trigger:focus-visible { outline: 2px solid var(--ui-focus); outline-offset: -2px; }
.acc-chevron { flex: 0 0 auto; width: 8px; height: 8px; border-right: 1.75px solid var(--ui-ink-muted); border-bottom: 1.75px solid var(--ui-ink-muted); transform: rotate(45deg); transition: transform var(--ui-motion-base) var(--ui-ease-standard), border-color var(--ui-motion-fast) var(--ui-ease-standard); }
.acc-trigger[aria-expanded="true"] .acc-chevron { transform: rotate(225deg); border-color: var(--ui-ink); }
.acc-panel { display: grid; grid-template-rows: 0fr; opacity: 0; transition: grid-template-rows var(--ui-motion-base) var(--ui-ease-standard), opacity var(--ui-motion-base) var(--ui-ease-standard); }
.acc-panel > div { overflow: hidden; color: var(--ui-ink-soft); font-size: var(--ui-text-sm); }
.acc-item[data-open="true"] .acc-panel { grid-template-rows: 1fr; opacity: 1; }
.acc-panel p { margin: 0; padding: 0 0 16px; }
.alert { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; border: 1px solid var(--ui-accent-line); border-left: 3px solid var(--ui-accent); border-radius: var(--ui-radius-card); background: var(--ui-accent-soft); color: var(--ui-accent-text); font-size: var(--ui-text-sm); line-height: var(--ui-leading-normal); }
.alert strong { font-size: var(--ui-text-sm); font-weight: 600; line-height: var(--ui-leading-snug); }
.progress { display: flex; flex-direction: column; gap: 6px; }
.progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; color: var(--ui-ink-soft); font-size: var(--ui-text-xs); }
.progress-value { font-weight: 600; font-variant-numeric: tabular-nums; }
.progress-track { height: 8px; overflow: hidden; border-radius: var(--ui-radius-pill); background: var(--ui-control-track); }
.progress-fill { width: 28%; height: 100%; border-radius: inherit; background: var(--ui-accent); transition: width var(--ui-motion-slow) var(--ui-ease-standard); }
.counter { display: flex; align-items: center; gap: 8px; }
.counter-value { min-width: 4ch; color: var(--ui-ink); font-family: var(--ui-font-mono); font-size: var(--ui-text-md); font-weight: 600; font-variant-numeric: tabular-nums; text-align: center; }
.counter-value > span { display: inline-block; transition: transform 160ms var(--ui-ease-standard), opacity 160ms var(--ui-ease-standard); }
@starting-style { .counter-value > span { transform: scale(1.12); opacity: 0.65; } }
.copy { display: inline-flex; align-items: center; gap: 8px; }
.copy-feedback { display: inline-block; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); transition: opacity var(--ui-motion-fast) var(--ui-ease-standard), transform var(--ui-motion-base) var(--ui-ease-standard), filter var(--ui-motion-base) var(--ui-ease-standard); }
@starting-style { .copy-feedback { opacity: 0; transform: translateY(0.25em); filter: blur(2px); } }
.copy-feedback[data-state="success"] { color: var(--ui-success); }
.loading-row { display: flex; align-items: center; gap: 14px; }
.spinner { flex: none; width: 24px; height: 24px; border: 2px solid var(--ui-line); border-top-color: var(--ui-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
.skeleton { flex: 1 1 auto; height: 12px; border-radius: var(--ui-radius-control); background-color: var(--ui-surface-subtle); background-image: linear-gradient(90deg, transparent 0%, var(--ui-surface-hover) 50%, transparent 100%); background-repeat: no-repeat; background-size: 200% 100%; animation: shimmer 1.4s linear infinite; }
@keyframes spin { to { transform: rotate(1turn); } }
@keyframes shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
.table { width: 100%; border-collapse: collapse; font-size: var(--ui-text-sm); line-height: var(--ui-leading-normal); }
.table th, .table td { padding: var(--ui-table-cell-padding-y) var(--ui-table-cell-padding-x); border-bottom: 1px solid var(--ui-line); text-align: left; vertical-align: middle; }
.table th { border-bottom-color: var(--ui-line-strong); color: var(--ui-ink-soft); font-weight: 600; }
.table tbody tr:last-child td { border-bottom: 0; }
.table tbody tr:hover td { background: var(--ui-surface-hover); }
.table tr[aria-selected="true"] td { background: var(--ui-accent-soft); }
.table tr[aria-selected="true"] td:first-child { box-shadow: inset 2px 0 var(--ui-accent); }
.tooltip-anchor { position: relative; display: inline-flex; }
.tooltip-anchor::after { content: attr(data-tooltip); position: absolute; z-index: 30; bottom: calc(100% + 8px); left: 50%; width: max-content; max-width: 18rem; padding: 8px 12px; border-radius: var(--ui-radius-control); background: var(--ui-tooltip-bg); color: var(--ui-tooltip-ink); box-shadow: var(--ui-shadow-md); font-size: var(--ui-text-xs); font-weight: 500; line-height: var(--ui-leading-snug); opacity: 0; transform: translate(-50%, 6px); pointer-events: none; transition: opacity 170ms var(--ui-ease-standard), transform 170ms var(--ui-ease-standard); }
.tooltip-anchor:hover::after, .tooltip-anchor:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }
.dialog, .popover { border: 1px solid var(--ui-line); background: var(--ui-surface); color: var(--ui-ink); box-shadow: var(--ui-overlay-shadow); }
.dialog { width: min(440px, calc(100vw - 32px)); padding: 24px; border-radius: var(--ui-radius-panel); opacity: 0; transform: scale(0.96); transition: opacity var(--ui-motion-base) var(--ui-ease-standard), transform var(--ui-motion-base) var(--ui-ease-standard), display var(--ui-motion-base) var(--ui-ease-standard), overlay var(--ui-motion-base) var(--ui-ease-standard); transition-behavior: allow-discrete; }
.dialog[open] { opacity: 1; transform: none; }
@starting-style { .dialog[open] { opacity: 0; transform: scale(0.96); } }
.dialog::backdrop { background: color-mix(in srgb, #171a1f 42%, transparent); opacity: 0; transition: opacity var(--ui-motion-base) var(--ui-ease-standard), display var(--ui-motion-base) var(--ui-ease-standard), overlay var(--ui-motion-base) var(--ui-ease-standard); transition-behavior: allow-discrete; }
.dialog[open]::backdrop { opacity: 1; }
@starting-style { .dialog[open]::backdrop { opacity: 0; } }
.dialog h3 { margin: 0 0 8px; font-size: var(--ui-text-lg); font-weight: 600; letter-spacing: -0.01em; }
.dialog p { margin: 0; color: var(--ui-ink-soft); font-size: var(--ui-text-sm); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.popover { width: min(320px, calc(100vw - 32px)); margin: auto; padding: 16px; border-radius: var(--ui-radius-card); opacity: 0; transform: scale(0.98); transition: opacity var(--ui-motion-base) var(--ui-ease-standard), transform var(--ui-motion-base) var(--ui-ease-standard), display var(--ui-motion-base) var(--ui-ease-standard), overlay var(--ui-motion-base) var(--ui-ease-standard); transition-behavior: allow-discrete; }
.popover:popover-open { opacity: 1; transform: none; }
@starting-style { .popover:popover-open { opacity: 0; transform: scale(0.98); } }
.popover p { margin: 0 0 8px; color: var(--ui-ink-soft); font-size: var(--ui-text-sm); }
.popover code { color: var(--ui-ink); }

/* ------------------------------------------------------------------- a11y */
.a11y-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.a11y-list li { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--ui-line); color: var(--ui-ink-soft); font-size: var(--ui-text-sm); }
.a11y-list li:last-child { border-bottom: 0; }
.a11y-list strong { color: var(--ui-ink); font-weight: 600; }
.footnote { margin: 32px 0 0; color: var(--ui-ink-muted); font-size: var(--ui-text-xs); line-height: var(--ui-leading-normal); }
.footnote code { color: var(--ui-ink-soft); }

@media (max-width: 880px) {
  .topnav { display: none; }
  .section-head, .spec-row { grid-template-columns: 1fr; gap: 8px; }
  .subgrid, .demo-grid { grid-template-columns: 1fr; }
  .page { width: min(100% - 32px, 720px); padding-top: 32px; }
  .hero { padding-top: 24px; }
  .hero h1 { font-size: var(--ui-text-xl); }
  .lede { font-size: var(--ui-text-md); }
  .topbar { padding-inline: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .motion-fill { width: 100% !important; }
  .acc-panel { grid-template-rows: auto; opacity: 1; }
  .acc-chevron { transform: rotate(45deg); }
}
@media print {
  .topbar, .hero-actions, .theme-toggle, .motion-list, .demo-panel { display: none !important; }
  body { background: #ffffff; }
  .page { width: 100%; padding: 0; }
  .section { break-inside: avoid; page-break-inside: avoid; }
  .shadow-tile { box-shadow: none !important; border: 1px solid #d6d4d2; }
}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <a class="brand" href="#main"><span class="brand-mark">RMD</span><span class="brand-text">Product UI</span></a>
  <nav class="topnav" aria-label="Sections">
    <a href="#type">Type</a><a href="#color">Color</a><a href="#shape">Shape</a><a href="#motion">Motion</a><a href="#components">Components</a><a href="#a11y">Accessibility</a>
  </nav>
  <button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false">
    <span class="theme-dot" aria-hidden="true"></span><span id="theme-label">Dark</span>
  </button>
</header>
<main id="main" class="page">
  <section class="hero">
    <p class="eyebrow">Design language specimen · v1.0</p>
    <h1>Calm surfaces. One accent. Short motion.</h1>
    <p class="lede">A working-document system: warm paper, white surfaces, near-black ink, one blue accent, a 12–28px type scale and 150/220/300ms eased motion. Elevation belongs to floating layers; content surfaces use rules, dividers and background steps.</p>
    <div class="hero-meta">
      <span class="badge badge-info">light + dark</span>
      <span class="badge">16px body / 1.7</span>
      <span class="badge">4px space unit</span>
      <span class="badge">0 bounce</span>
      <span class="badge">${typeRoleCount} type roles</span>
    </div>
    <div class="hero-actions">
      <button class="btn btn-primary" type="button" data-open-dialog>Primary action</button>
      <button class="btn" type="button">Secondary</button>
      <button class="btn btn-quiet" type="button">Quiet action</button>
      <span class="tooltip-anchor" tabindex="0" data-tooltip="Tooltips use an ink surface, surface-colored text and 170ms motion."><button class="btn btn-small" type="button">Tooltip</button></span>
    </div>
  </section>

  <section class="section" id="type">
    <header class="section-head">
      <div><h2>Type scale</h2><p class="section-note">Every step derives from the 16px body.</p></div>
      <p>Headings use weight 700 and negative tracking. Titles and group labels use 600. Body stays 400 at 1.7; labels and controls use 1.25. Tabular numerals carry every changing value.</p>
    </header>
    <div class="spec-list">${typeRows()}</div>
  </section>

  <section class="section" id="color">
    <header class="section-head">
      <div><h2>Color</h2><p class="section-note">Warm neutral surfaces, one blue accent.</p></div>
      <p>Color is reserved for action and state. Status colors are semantic and always pair a soft fill with a matching line and ink. The dark scheme inverts the accent: a lighter blue fill carries dark ink, while lighter blue is used as text.</p>
    </header>
    ${swatchGroup(tokens, 'Surfaces and ink', SURFACE_KEYS)}
    ${swatchGroup(tokens, 'Accent and focus', ACCENT_KEYS)}
    ${swatchGroup(tokens, 'Status and tooltip', STATUS_KEYS)}
    ${swatchGroup(tokens, 'Data and code', DATA_KEYS)}
  </section>

  <section class="section" id="shape">
    <header class="section-head">
      <div><h2>Space and shape</h2><p class="section-note">4px unit, rounded rectangles, soft depth.</p></div>
      <p>Spacing is a 4px scale with 16px block gaps and 32px section gaps. Fields and controls use 8px, buttons 10px, cards 12px and panels 14px. Pills are reserved for badges and switches; content surfaces do not carry shadows.</p>
    </header>
    <div class="subgrid">
      <div><h3 class="subhead">Spacing</h3><div class="space-list">${spacingRows(tokens)}</div></div>
      <div><h3 class="subhead">Radius</h3><div class="radius-grid">${radiusTiles(tokens)}</div></div>
    </div>
    <h3 class="subhead" style="margin-top: 32px">Elevation</h3>
    ${shadowTiles(tokens)}
  </section>

  <section class="section" id="motion">
    <header class="section-head">
      <div><h2>Motion</h2><p class="section-note">Short, eased, reversible, never decorative.</p></div>
      <p>State changes use 150ms, structure 220ms and progress 300ms. Entrances use small scale changes, not slides. The standard curve is cubic-bezier(0.22, 0.61, 0.36, 1); there is no bounce and no infinite decoration. Loading spinners and skeletons are the only loops.</p>
    </header>
    <div class="motion-list">${motionRows()}</div>
  </section>

  <section class="section" id="components">
    <header class="section-head">
      <div><h2>Components</h2><p class="section-note">Controls stay controls; panels carry the border.</p></div>
      <p>Buttons, fields, switches, segmented choices, tabs, disclosures and feedback share one surface budget. A card is a background-only tile, a panel is the one bordered content container, and an overlay is the only place for elevation.</p>
    </header>
    <div class="demo-panel">
      <div class="demo-grid">
        <div class="demo">
          <p class="demo-label">Actions</p>
          <div class="inline-row">
            <button class="btn btn-primary" type="button" data-open-dialog>Primary</button>
            <button class="btn" type="button">Secondary</button>
            <button class="btn btn-quiet" type="button">Quiet</button>
            <button class="btn btn-small" type="button">Small</button>
          </div>
          <div class="inline-row">
            <span class="badge badge-info">Info</span>
            <span class="badge badge-success">Success</span>
            <span class="badge badge-warning">Warning</span>
            <span class="badge badge-danger">Danger</span>
          </div>
          <div class="copy">
            <button class="btn btn-small" type="button" data-copy>Copy token</button>
            <span class="copy-feedback">Ready</span>
          </div>
        </div>

        <div class="demo">
          <p class="demo-label">Fields</p>
          <label class="field"><span>Workspace name</span><input class="input" value="Product UI"><small>Labels use 14px / 600.</small></label>
          <label class="field"><span>Access email</span><input class="input" aria-invalid="true" value="name@"><small>Invalid fields take the danger border and a 3px halo.</small></label>
          <label class="field"><span>Notes</span><textarea class="textarea">A quiet field surface with an 8px radius.</textarea></label>
        </div>

        <div class="demo">
          <p class="demo-label">Selection</p>
          <label class="switch-row"><input class="switch" type="checkbox" checked><span>Sync changes automatically</span></label>
          <label class="check-row"><input class="check" type="checkbox" checked><span>Include archived documents</span></label>
          <div class="segmented" data-segmented role="group" aria-label="Density">
            <button type="button" aria-pressed="true">Compact</button>
            <button type="button" aria-pressed="false">Default</button>
            <button type="button" aria-pressed="false">Comfortable</button>
          </div>
        </div>

        <div class="demo">
          <p class="demo-label">Tabs</p>
          <div class="tabs" data-tabs role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected="true">Overview</button>
            <button type="button" role="tab" aria-selected="false">Activity</button>
            <button type="button" role="tab" aria-selected="false">Settings</button>
          </div>
          <div class="tabpanel" role="tabpanel">The selected tab owns a 3px accent underline that slides in 220ms.</div>
          <div class="tabpanel" role="tabpanel" hidden>Panels fade in from 4px below with the same 220ms structure.</div>
          <div class="tabpanel" role="tabpanel" hidden>State is carried by aria-selected, not by a separate class.</div>
        </div>

        <div class="demo">
          <p class="demo-label">Disclosure</p>
          <div class="accordion">
            <div class="acc-item" data-open="true">
              <button class="acc-trigger" type="button" aria-expanded="true"><span>What opens and closes?</span><span class="acc-chevron" aria-hidden="true"></span></button>
              <div class="acc-panel"><div><p>The body travels from -6px with a 2px blur and settles in 220ms. The chevron rotates 180 degrees on the same clock.</p></div></div>
            </div>
            <div class="acc-item" data-open="false">
              <button class="acc-trigger" type="button" aria-expanded="false"><span>Does it animate height?</span><span class="acc-chevron" aria-hidden="true"></span></button>
              <div class="acc-panel"><div><p>RMD uses interpolate-size and height:auto. The preview uses a 0fr to 1fr grid row so the same rhythm works in every modern browser.</p></div></div>
            </div>
          </div>
        </div>

        <div class="demo">
          <p class="demo-label">Feedback and data</p>
          <div class="alert"><strong>One semantic left rule.</strong> Alerts use a soft tone fill, a tone line and a 3px semantic edge.</div>
          <div class="progress">
            <div class="progress-head"><span>Upload progress</span><span class="progress-value">28%</span></div>
            <div class="progress-track"><div class="progress-fill"></div></div>
            <button class="btn btn-small" type="button" data-progress>Advance</button>
          </div>
          <div class="counter">
            <button class="btn btn-small" type="button" data-counter="-1" aria-label="Decrease">−</button>
            <span class="counter-value"><span>0</span></span>
            <button class="btn btn-small" type="button" data-counter="1" aria-label="Increase">+</button>
          </div>
          <div class="loading-row"><span class="spinner" aria-label="Loading"></span><span class="skeleton" aria-hidden="true"></span></div>
        </div>
      </div>

      <h3 class="subhead" style="margin-top: 28px">Table selection</h3>
      <table class="table">
        <thead><tr><th scope="col">Document</th><th scope="col">Owner</th><th scope="col">Updated</th></tr></thead>
        <tbody>
          <tr aria-selected="true"><td>Product brief</td><td>Design</td><td>2 min ago</td></tr>
          <tr><td>Pricing model</td><td>Finance</td><td>Yesterday</td></tr>
          <tr><td>Launch checklist</td><td>Program</td><td>3 days ago</td></tr>
        </tbody>
      </table>

      <h3 class="subhead" style="margin-top: 28px">Overlays</h3>
      <div class="inline-row">
        <button class="btn" type="button" data-open-dialog>Open dialog</button>
        <button class="btn" type="button" popovertarget="demo-popover">Open popover</button>
        <span class="tooltip-anchor" tabindex="0" data-tooltip="Tooltip: 12px / 500, ink surface, 8px radius, 170ms."><button class="btn btn-small" type="button">Hover tooltip</button></span>
      </div>
    </div>
  </section>

  <section class="section" id="a11y">
    <header class="section-head">
      <div><h2>Accessibility</h2><p class="section-note">State is never carried by motion alone.</p></div>
      <p>Focus rings stay visible, selected states change color and form, and reduced-motion settles every entrance at its resting frame. The hairline border is intentionally quiet; do not rely on it alone to identify a control in a strict WCAG 1.4.11 context.</p>
    </header>
    <ul class="a11y-list">
      <li><strong>Focus</strong><span>2px focus color, 2px offset; inset -2px on tabs and menu rows. Field focus adds a 3px halo at 16% (22% dark).</span></li>
      <li><strong>Hit area</strong><span>38px default control, 44px large or row-sized target, 44px slider hit target, 18px checkbox inside a 44px row.</span></li>
      <li><strong>Reduced motion</strong><span>Duration collapses to 0.01ms and iteration to 1; entry states settle at opacity 1, scale 1, transform none and filter none.</span></li>
      <li><strong>Forced colors</strong><span>Borders use CanvasText/Highlight; platform marks return for checkboxes and radios; shadows and translucent backdrops are removed.</span></li>
      <li><strong>Print</strong><span>Motion stops, shadows flatten, overlays expand, and charts keep the warm print-safe palette.</span></li>
    </ul>
    <p class="footnote">Generated by <code>scripts/rmd-ui.mjs preview</code> from <code>assets/tokens.json</code>. Measurement basis: ReactiveMD Product UI 0.9.2. The specimen is self-contained.</p>
  </section>
</main>

<dialog class="dialog" id="demo-dialog">
  <h3>Dialog surface</h3>
  <p>Dialogs enter from 96% scale with a fading backdrop. The open state ends at transform: none so the top layer does not become a containing block for fixed descendants.</p>
  <div class="dialog-actions">
    <button class="btn" type="button" data-close-dialog>Close</button>
    <button class="btn btn-primary" type="button" data-close-dialog>Confirm</button>
  </div>
</dialog>

<div class="popover" id="demo-popover" popover>
  <p><strong>Popover</strong></p>
  <p>Popovers enter from 98% scale. Placement belongs to the author, so the shared motion never adds a directional slide.</p>
  <p><code>220ms · standard easing</code></p>
</div>

<script>
(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    document.querySelectorAll('[data-value]').forEach((node) => {
      node.textContent = node.dataset[theme] ?? '';
    });
  };
  themeButton.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  applyTheme(root.dataset.theme || 'light');

  document.querySelectorAll('[data-play]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('[data-motion]');
      const fill = row.querySelector('.motion-fill');
      const duration = Number(row.dataset.motion);
      fill.style.transition = 'none';
      fill.style.width = '0%';
      void fill.offsetWidth;
      fill.style.transition = 'width ' + duration + 'ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      fill.style.width = '100%';
    });
  });

  const dialog = document.getElementById('demo-dialog');
  document.querySelectorAll('[data-open-dialog]').forEach((button) => {
    button.addEventListener('click', () => dialog.showModal());
  });
  document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const buttons = [...tabs.querySelectorAll('[role="tab"]')];
    const panels = [...tabs.parentElement.querySelectorAll('[role="tabpanel"]')];
    tabs.style.setProperty('--tab-count', String(buttons.length));
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        buttons.forEach((item, itemIndex) => {
          item.setAttribute('aria-selected', String(itemIndex === index));
          item.tabIndex = itemIndex === index ? 0 : -1;
        });
        panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index; });
        tabs.style.setProperty('--tab-index', String(index));
      });
    });
  });

  document.querySelectorAll('[data-segmented]').forEach((segmented) => {
    const buttons = [...segmented.querySelectorAll('button')];
    segmented.style.setProperty('--seg-count', String(buttons.length));
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        buttons.forEach((item, itemIndex) => item.setAttribute('aria-pressed', String(itemIndex === index)));
        segmented.style.setProperty('--seg-index', String(index));
      });
    });
  });

  document.querySelectorAll('.acc-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.acc-item');
      const open = item.dataset.open === 'true';
      item.dataset.open = String(!open);
      trigger.setAttribute('aria-expanded', String(!open));
    });
  });

  let progress = 28;
  const progressFill = document.querySelector('.progress-fill');
  const progressValue = document.querySelector('.progress-value');
  document.querySelector('[data-progress]').addEventListener('click', () => {
    progress = progress >= 100 ? 28 : Math.min(100, progress + 18);
    progressFill.style.width = progress + '%';
    progressValue.textContent = progress + '%';
  });

  let count = 0;
  const counterValue = document.querySelector('.counter-value');
  document.querySelectorAll('[data-counter]').forEach((button) => {
    button.addEventListener('click', () => {
      count += Number(button.dataset.counter);
      const next = document.createElement('span');
      next.textContent = String(count);
      counterValue.replaceChildren(next);
    });
  });

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText('--ui-surface'); } catch {}
      const current = document.querySelector('.copy-feedback');
      const next = document.createElement('span');
      next.className = 'copy-feedback';
      next.dataset.state = 'success';
      next.textContent = 'Copied';
      current.replaceWith(next);
      window.setTimeout(() => {
        if (!next.isConnected) return;
        const reset = document.createElement('span');
        reset.className = 'copy-feedback';
        reset.textContent = 'Ready';
        next.replaceWith(reset);
      }, 1600);
    });
  });
})();
</script>
</body>
</html>
`;
}