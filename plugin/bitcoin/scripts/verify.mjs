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

const ticker = (price, changePercent, eventTime) => JSON.stringify({
  e: '24hrTicker',
  E: eventTime,
  s: 'BTCUSDT',
  p: '1234.56',
  P: String(changePercent),
  w: '96000.00',
  x: '95000.00',
  c: String(price),
  Q: '0.25',
  b: String(price - 1),
  B: '5',
  a: String(price + 1),
  A: '6',
  o: '95000.00',
  h: '98250.50',
  l: '94100.25',
  v: '12345.678',
  q: '1195000000',
  O: eventTime - 86_400_000,
  C: eventTime,
});

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 960 } });
const page = await context.newPage();
const errors = [];
let connections = 0;
let latestRoute = null;

page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

let routeCloses = 0;

await page.routeWebSocket(/wss:\/\/(?:data-stream\.binance\.vision|stream\.binance\.com(?::\d+)?)\/ws\/btcusdt@ticker/, (ws) => {
  connections += 1;
  latestRoute = ws;
  const send = () => {
    if (connections === 1) ws.send(ticker('97000.12', 2.34, Date.now()));
    else ws.send(ticker('98123.45', -1.08, Date.now()));
  };
  setTimeout(send, 30);
});

const check = (condition, message) => {
  if (!condition) throw new Error(message);
  process.stdout.write(`PASS ${message}\n`);
};

const waitFor = async (predicate, message, timeout = 5_000) => {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > timeout) throw new Error(message);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

try {
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  const card = page.locator('.rmd-bitcoin').first();
  await card.waitFor({ state: 'visible', timeout: 15_000 });

  const status = card.locator('[data-rmd-part="status"]');
  const price = card.locator('[data-rmd-part="price"]');

  await page.waitForFunction(() => document.querySelector('[data-rmd-part="status"]')?.textContent === '实时', null, { timeout: 10_000 });
  check(true, 'live status after the first tick');
  check((await price.textContent())?.includes('97,000.12'), 'first tick price is displayed');
  check((await card.locator('[data-rmd-part="change"]').textContent())?.includes('+2.34%'), '24h change is displayed');
  const stats = await card.locator('[data-rmd-part="stats"] dd').allTextContents();
  check(stats[0] === '98,250.50' && stats[1] === '94,100.25', '24h high and low are displayed');
  check((stats[2] ?? '').length > 0 && stats[2] !== '—', '24h turnover is displayed');
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/preview-light.png', import.meta.url)), fullPage: true });

  await latestRoute.close();
  await page.waitForFunction(() => document.querySelector('[data-rmd-part="status"]')?.textContent === '重连中…', null, { timeout: 5_000 });
  check(true, 'reconnecting status after the socket closes');

  await page.waitForFunction(() => document.querySelector('[data-rmd-part="price"]')?.textContent?.includes('98,123.45'), null, { timeout: 10_000 });
  await page.waitForFunction(() => document.querySelector('[data-rmd-part="status"]')?.textContent === '实时', null, { timeout: 5_000 });
  check(connections >= 2, 'the host opened a new WebSocket after the disconnect');
  check((await card.locator('[data-rmd-part="change"]').textContent())?.includes('-1.08%'), 'the second tick updates the quote');

  await page.getByRole('button', { name: '静态预览' }).click();
  await page.waitForFunction(() => document.querySelector('[data-rmd-part="status"]')?.textContent === '静态', null, { timeout: 5_000 });
  check((await page.locator('.rmd-bitcoin').first().innerText()).includes('实时价格在交互模式中显示。'), 'static mode renders the static frame');
  await page.getByRole('button', { name: '返回交互' }).click();
  await page.waitForFunction(() => document.querySelector('[data-rmd-part="status"]')?.textContent === '实时', null, { timeout: 10_000 });
  check(true, 'returning to interactive mode resumes the feed');

  latestRoute.onClose(() => {
    routeCloses += 1;
  });
  await page.getByLabel('允许连接 Binance').uncheck();
  await page.waitForFunction(() => document.querySelector('[data-rmd-part="status"]')?.textContent === '实时通道未启用', null, { timeout: 5_000 });
  check(true, 'revoking the host network grant shows the unavailable state');
  await waitFor(
    () => routeCloses > 0,
    'The socket stayed open after the network grant was revoked.',
  );
  check(true, 'the host closes the socket after the runtime releases the channel');

  await page.getByRole('button', { name: '切换到深色' }).click();
  check(await page.locator('main.bitcoin-page').getAttribute('data-scheme') === 'dark', 'page switches to the dark scheme');
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/preview-dark.png', import.meta.url)), fullPage: true });

  await page.setViewportSize({ width: 375, height: 812 });
  check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'the layout does not overflow at 375px');
  await page.screenshot({ path: fileURLToPath(new URL('../artifacts/preview-mobile.png', import.meta.url)), fullPage: true });

  check(errors.length === 0, `no page or console errors (${errors.join(' | ')})`);
} finally {
  await browser.close();
  stopServer();
}
