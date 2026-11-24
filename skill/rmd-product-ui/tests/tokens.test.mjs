import assert from 'node:assert/strict';
import test from 'node:test';
import { cssVar, emitTokenCss, emitTokenJson, loadTokens, tokenSummary } from '../scripts/lib/tokens.mjs';

const tokens = loadTokens();

test('token data contains both schemes and the core contract', () => {
  assert.equal(tokens.meta.sourceVersion, 'reactive-md 0.9.2');
  assert.equal(tokens.color.light.surface, '#ffffff');
  assert.equal(tokens.color.dark.surface, '#1c1d20');
  assert.equal(tokens.type['2xl'], '28px');
  assert.equal(tokens.motion.base, '220ms');
  assert.ok(tokenSummary(tokens).total > 120);
});

test('CSS emitter applies a prefix and emits the dark selector', () => {
  const css = emitTokenCss(tokens, { prefix: 'app' });
  assert.match(css, /--app-paper: #f5f3f1;/);
  assert.match(css, /--app-text-2xl: 28px;/);
  assert.match(css, /--app-button-press-shadow:/);
  assert.match(css, /\[data-theme="dark"\], \[data-color-scheme="dark"\]/);
  assert.match(css, /--app-paper: #141517;/);
});

test('empty prefix emits native RMD variable names', () => {
  assert.equal(cssVar('paper', ''), '--paper');
  const css = emitTokenCss(tokens, { prefix: '', autoDark: false });
  assert.match(css, /--paper: #f5f3f1;/);
  assert.match(css, /--radius-field: 8px;/);
});

test('utilities use the shared type roles', () => {
  const css = emitTokenCss(tokens, { utilities: true });
  assert.match(css, /\.ui-type-display/);
  assert.match(css, /\.ui-type-block-title/);
  assert.match(css, /\.ui-type-numeric \{/);
});

test('JSON output round-trips', () => {
  const parsed = JSON.parse(emitTokenJson(tokens));
  assert.deepEqual(parsed.color.light.accent, '#1f5ae8');
});