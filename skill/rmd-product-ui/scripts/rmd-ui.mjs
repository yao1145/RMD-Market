#!/usr/bin/env node
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { auditCss, RULE_CATALOG, summarizeFindings } from './lib/audit.mjs';
import { checkTokenContrast, DEFAULT_PAIRS, formatRatio, summarizeContrast } from './lib/contrast.mjs';
import { renderPreview } from './lib/preview.mjs';
import { emitTokenCss, emitTokenJson, loadTokens, normalizePrefix, tokenSummary } from './lib/tokens.mjs';

const HELP = `RMD Product UI design tools

Usage:
  node scripts/rmd-ui.mjs tokens [--format css|json] [--prefix ui] [--out file]
                                 [--no-auto-dark] [--no-density] [--utilities]
  node scripts/rmd-ui.mjs audit [paths...] [--format text|json] [--fail-on none|warn|info]
                                [--disable RULE,...] [--exclude pattern,...] [--quiet]
  node scripts/rmd-ui.mjs contrast [--format text|json] [--all] [--strict]
  node scripts/rmd-ui.mjs preview [--out file] [--title text]
  node scripts/rmd-ui.mjs rules
  node scripts/rmd-ui.mjs help

Examples:
  node scripts/rmd-ui.mjs tokens --format css > design-tokens.css
  node scripts/rmd-ui.mjs tokens --format css --prefix app --utilities > app-tokens.css
  node scripts/rmd-ui.mjs audit src --fail-on warn
  node scripts/rmd-ui.mjs contrast --strict
  node scripts/rmd-ui.mjs preview --out product-ui-preview.html

Audit rule ids:
${RULE_CATALOG.map((rule) => `  ${rule.id.padEnd(10)} ${rule.severity.padEnd(7)} ${rule.title}`).join('\n')}
`;

const DEFAULT_EXCLUDES = [
  'node_modules', '.git', 'dist', 'build', 'coverage', 'vendor',
  '.next', '.nuxt', '.svelte-kit', 'artifacts',
];

function toPosix(value) {
  return value.replaceAll('\\', '/');
}

function relative(file) {
  return toPosix(path.relative(process.cwd(), file)) || '.';
}

async function collectCssFiles(targets, excludes) {
  const patterns = excludes.map(toPosix).filter(Boolean);
  const files = [];
  const visit = async (target) => {
    const info = await stat(target);
    if (info.isFile()) {
      if (target.toLowerCase().endsWith('.css')) files.push(path.resolve(target));
      return;
    }
    if (!info.isDirectory()) return;
    const entries = await readdir(target, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(target, entry.name);
      const normalized = toPosix(full);
      if (patterns.some((pattern) => normalized.includes(pattern))) continue;
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.css')) files.push(path.resolve(full));
    }
  };
  for (const target of targets) await visit(target);
  return [...new Set(files)].sort();
}

function parseList(value) {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

function printFindingsText(results) {
  const all = results.flatMap((result) => result.findings);
  if (!all.length) {
    console.log('No findings.');
    return;
  }
  for (const result of results) {
    if (!result.findings.length) continue;
    console.log(`\n${result.filename}`);
    for (const finding of result.findings) {
      const selector = finding.selector ? `  selector: ${finding.selector}` : '';
      console.log(`  ${String(finding.line).padStart(4)}  ${finding.severity.toUpperCase().padEnd(7)} ${finding.rule}  ${finding.message}`);
      if (selector) console.log(selector);
      if (finding.hint) console.log(`        hint: ${finding.hint}`);
    }
  }
}

function printSummary(summary, fileCount) {
  console.log(`\n${fileCount} CSS file${fileCount === 1 ? '' : 's'} · ${summary.total} finding${summary.total === 1 ? '' : 's'} · ${summary.warning} warning${summary.warning === 1 ? '' : 's'} · ${summary.info} info`);
}

function printContrastText(results, summary) {
  for (const mode of ['light', 'dark']) {
    console.log(`\n${mode.toUpperCase()}`);
    for (const result of results.filter((item) => item.mode === mode)) {
      const ratio = result.ratio === null ? '  n/a ' : formatRatio(result.ratio).padStart(8);
      const status = result.pass ? 'PASS' : 'FAIL';
      const threshold = `${result.min}:1`.padStart(5);
      console.log(`  ${ratio}  ${status}  ${result.role.padEnd(11)} ${threshold}  ${result.name}  (${result.fgToken ?? result.fg} on ${result.bgToken ?? result.bg})`);
      if (result.error) console.log(`          ${result.error}`);
    }
  }
  console.log(`\nContrast summary: ${summary.pass} pass, ${summary.fail} fail` +
    (summary.textFail ? ` · text ${summary.textFail}` : '') +
    (summary.nonTextFail ? ` · non-text ${summary.nonTextFail}` : '') +
    (summary.decorativeFail ? ` · decorative ${summary.decorativeFail}` : ''));
}

async function commandTokens(values) {
  const tokens = loadTokens();
  const format = values.format ?? 'css';
  let output;
  if (format === 'css') {
    output = emitTokenCss(tokens, {
      prefix: values.prefix ?? 'ui',
      autoDark: !values['no-auto-dark'],
      density: !values['no-density'],
      utilities: Boolean(values.utilities),
    });
  } else if (format === 'json') {
    output = emitTokenJson(tokens);
  } else {
    throw new Error(`Unknown token format: ${format}. Use css or json.`);
  }
  if (values.out) {
    await mkdir(path.dirname(path.resolve(values.out)), { recursive: true });
    await writeFile(values.out, output);
    const summary = tokenSummary(tokens);
    console.log(`Wrote ${values.out} (${summary.total} declarations, prefix "${normalizePrefix(values.prefix ?? 'ui') || 'none'}").`);
  } else {
    process.stdout.write(output);
  }
}

async function commandAudit(values, targets) {
  const excludes = [...DEFAULT_EXCLUDES, ...parseList(values.exclude)];
  const files = await collectCssFiles(targets.length ? targets : ['.'], excludes);
  if (!files.length) {
    console.error('No CSS files found.');
    process.exitCode = 2;
    return;
  }
  const disabledRules = new Set(parseList(values.disable));
  const results = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const result = auditCss(source, { filename: relative(file), disabledRules });
    results.push(result);
  }
  const findings = results.flatMap((result) => result.findings);
  const summary = summarizeFindings(findings);
  if (values.format === 'json') {
    console.log(JSON.stringify({ files: files.map(relative), summary, findings }, null, 2));
  } else if (!values.quiet) {
    printFindingsText(results);
    printSummary(summary, files.length);
  } else {
    printSummary(summary, files.length);
  }
  const failOn = values['fail-on'] ?? 'none';
  if (failOn === 'warn' && (summary.warning + summary.error) > 0) process.exitCode = 1;
  if (failOn === 'info' && summary.total > 0) process.exitCode = 1;
  if (failOn === 'error' && summary.error > 0) process.exitCode = 1;
}

function commandContrast(values) {
  const tokens = loadTokens();
  const all = checkTokenContrast(tokens, DEFAULT_PAIRS);
  const includeDecorative = Boolean(values.all);
  const visible = includeDecorative ? all : all.filter((result) => result.role !== 'decorative');
  const summary = summarizeContrast(all, { includeDecorative });
  if (values.format === 'json') {
    console.log(JSON.stringify({ pairs: DEFAULT_PAIRS.length, results: visible, summary }, null, 2));
  } else {
    printContrastText(visible, summary);
  }
  if (values.strict && summary.fail > 0) process.exitCode = 1;
}

async function commandPreview(values) {
  const tokens = loadTokens();
  const html = renderPreview(tokens, { title: values.title });
  const out = values.out ?? 'product-ui-preview.html';
  await mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await writeFile(out, html);
  console.log(`Wrote ${out} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KiB). Open it in a browser.`);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      format: { type: 'string' },
      prefix: { type: 'string' },
      out: { type: 'string' },
      'no-auto-dark': { type: 'boolean' },
      'no-density': { type: 'boolean' },
      utilities: { type: 'boolean' },
      'fail-on': { type: 'string' },
      disable: { type: 'string' },
      exclude: { type: 'string' },
      quiet: { type: 'boolean' },
      strict: { type: 'boolean' },
      all: { type: 'boolean' },
      title: { type: 'string' },
      help: { type: 'boolean' },
    },
  });
  const command = positionals[0] ?? (values.help ? 'help' : 'help');
  try {
    if (command === 'help' || values.help) {
      console.log(HELP);
      return;
    }
    if (command === 'rules') {
      for (const rule of RULE_CATALOG) console.log(`${rule.id.padEnd(10)} ${rule.severity.padEnd(7)} ${rule.title}`);
      return;
    }
    if (command === 'tokens') return await commandTokens(values);
    if (command === 'audit') return await commandAudit(values, positionals.slice(1));
    if (command === 'contrast') return commandContrast(values);
    if (command === 'preview') return await commandPreview(values);
    console.error(`Unknown command: ${command}\n`);
    console.log(HELP);
    process.exitCode = 2;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();