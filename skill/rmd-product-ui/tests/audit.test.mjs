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

test('unrelated reduced-motion rules do not guard infinite animations', () => {
  const source = `
    .spinner, .skeleton { animation: pulse 0.8s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .spinner { animation: none; }
      .skeleton { transition: none; }
    }
  `;
  assert.ok(auditCss(source).findings.some(({ rule }) => rule === 'MOTION-004'));
});

test('a matching reduced-motion override can stop a shorthand animation', () => {
  const source = `
    .spinner, .skeleton { animation: pulse 0.8s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .skeleton, .spinner { animation: none; }
    }
  `;
  assert.deepEqual(auditCss(source).findings, []);
});

test('the universal reduced-motion rule can limit a longhand animation', () => {
  const source = `
    .spinner::before {
      animation-name: pulse;
      animation-duration: 150ms;
      animation-iteration-count: infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-iteration-count: 1 !important; }
    }
  `;
  assert.deepEqual(auditCss(source).findings, []);
  assert.ok(auditCss(source.replace('*, *::before, *::after', '*')).findings
    .some(({ rule }) => rule === 'MOTION-004'));
});
