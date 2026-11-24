import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio, normalizeHex, parseColor } from '../scripts/lib/color.mjs';

test('black on white is the 21:1 maximum', () => {
  assert.ok(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 0.01);
});

test('hex shorthand expands to six digits', () => {
  assert.equal(normalizeHex('#fff'), '#ffffff');
  assert.equal(normalizeHex('#0f08'), '#00ff00');
});

test('rgb and slash alpha parse', () => {
  assert.deepEqual(parseColor('rgb(255 0 0 / 50%)'), { r: 255, g: 0, b: 0, a: 0.5 });
  assert.deepEqual(parseColor('rgba(0, 128, 255, 0.25)'), { r: 0, g: 128, b: 255, a: 0.25 });
});

test('contrast rejects translucent colors', () => {
  assert.throws(() => contrastRatio('rgba(0, 0, 0, 0.5)', '#ffffff'), /opaque/);
});