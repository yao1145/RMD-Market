import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { auditCss } from '../scripts/lib/audit.mjs';

const clean = readFileSync(new URL('./fixtures/clean.css', import.meta.url), 'utf8');
const drift = readFileSync(new URL('./fixtures/drift.css', import.meta.url), 'utf8');

test('clean fixture has no findings', () => {
  const result = auditCss(clean, { filename: 'clean.css' });
  assert.deepEqual(result.findings, []);
});

test('drift fixture catches typography, shape, motion, color and focus drift', () => {
  const result = auditCss(drift, { filename: 'drift.css' });
  const ids = new Set(result.findings.map((finding) => finding.rule));
  for (const id of [
    'TYPE-001', 'TYPE-002', 'SHAPE-001', 'SHAPE-002',
    'MOTION-001', 'MOTION-002', 'MOTION-003', 'MOTION-005',
    'MOTION-006', 'COLOR-001', 'A11Y-001',
  ]) {
    assert.ok(ids.has(id), `expected ${id}, got ${[...ids].join(', ')}`);
  }
});

test('inline disable comments suppress a single line', () => {
  const source = '.x { font-size: 15px; /* rmd-ui-audit-disable */ }';
  assert.deepEqual(auditCss(source).findings, []);
});

test('file-level disable suppresses every finding', () => {
  const source = '/* rmd-ui-audit-disable-file */\n.x { font-size: 15px; }';
  assert.deepEqual(auditCss(source).findings, []);
});

test('print and forced-colors contexts may use raw fallback colors', () => {
  const source = '@media print { .x { color: #111111; } }';
  assert.deepEqual(auditCss(source).findings, []);
});