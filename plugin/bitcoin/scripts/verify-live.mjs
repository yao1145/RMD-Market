import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const pageUrl = process.env.BITCOIN_DEMO_URL ?? 'http://127.0.0.1:5211/';
const demoRoot = fileURLToPath(new URL('..', import.meta.url));
const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const artifactDirectory = fileURLToPath(new URL('../artifacts/', import.meta.url));
await mkdir(artifactDirectory, { recursive: true });

const reachable = async (url) => {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
};

let server;
if (!(await reachable(pageUrl))) {
  server = spawn(process.execPath, [vite, '--config', 'vite.config.ts'], {
    cwd: demoRoot,
    stdio: 'ignore',
    windowsHide: true,
  });
  const started = Date.now();
  while (!(await reachable(pageUrl))) {
    if (Date.now() - started > 20_000) {
      server.kill();
      throw new Error('Vite did not start within 20 seconds.');
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

const stopServer = () => {
  server?.kill('SIGKILL');
};

process.on('exit', stopServer);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
const errors = [];
const sockets = [];

page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});
page.on('websocket', (socket) => {
  sockets.push(socket.url());
});

try {
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  const card = page.locator('.rmd-bitcoin').first();
  await card.waitFor({ state: 'visible', timeout: 15_000 });

  await page.waitForFunction(() => {
    const status = document.querySelector('[data-rmd-part="status"]')?.textContent;
    const price = document.querySelector('[data-rmd-part="price"]')?.textContent ?? '';
    return status === '实时' && /\d/.test(price);
  }, null, { timeout: 30_000 }).catch(async () => {
    const status = await card.locator('[data-rmd-part="status"]').textContent().catch(() => 'unknown');
    const note = await card.locator('[data-rmd-part="note"]').textContent().catch(() => '');
    throw new Error(`Live feed did not open (status: ${status}; note: ${note}).`);
  });

  const price = (await card.locator('[data-rmd-part="price"]').textContent() ?? '').trim();
  const value = Number(price.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Live status without a valid price: ${price}`);
  const change = await card.locator('[data-rmd-part="change"]').textContent().catch(() => '');

  console.log(`LIVE price: ${price}`);
  console.log(`LIVE change: ${change?.trim() ?? 'n/a'}`);
  console.log(`WebSocket: ${sockets.filter(url => /data-stream\.binance\.vision|stream\.binance\.com/.test(url)).join(', ') || 'not observed'}`);
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/live.png', import.meta.url)), fullPage: true });

  if (errors.length > 0) throw new Error(errors.join(' | '));
  console.log('PASS live Binance feed');
} finally {
  await browser.close();
  stopServer();
}
