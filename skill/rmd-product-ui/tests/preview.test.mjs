import assert from 'node:assert/strict';
import test from 'node:test';
import { renderPreview } from '../scripts/lib/preview.mjs';
import { loadTokens } from '../scripts/lib/tokens.mjs';

test('preview is a self-contained interactive specimen', () => {
  const html = renderPreview(loadTokens());
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /--ui-paper: #f5f3f1;/);
  assert.match(html, /id="type"/);
  assert.match(html, /id="motion"/);
  assert.match(html, /data-motion="220"/);
  assert.match(html, /id="demo-dialog"/);
  assert.match(html, /prefers-reduced-motion/);
  assert.ok(html.length > 30_000);
});