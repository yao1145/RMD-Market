import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const harness = path.join(root, 'dist/harness.html');
if (!existsSync(harness)) throw new Error('Run the build before the browser smoke test.');

const channel = process.env.PLAYWRIGHT_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined);
const browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
const context = await browser.newContext({ offline: true, viewport: { width: 1100, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(String(error)));

const toggle = (label) => `(() => {
  const labels = [...document.querySelectorAll('label')];
  const match = labels.find((item) => (item.textContent || '').includes(${JSON.stringify(label)}));
  if (!match) return false;
  const input = match.querySelector('input[type="checkbox"]');
  if (!input) return false;
  input.click();
  return true;
})()`;

try {
  await page.goto(pathToFileURL(harness).href);
  await page.locator('[data-cattca]').waitFor({ state: 'visible' });

  assert.equal(await page.locator('[data-cattca] .rmd-cattca-title').textContent(), '床与晨光');
  assert.equal(await page.locator('[data-cattca]').getAttribute('data-cattca-state'), 'choice');
  assert.equal(await page.locator('[data-cattca-choice]').count(), 2);

  await page.locator('[data-cattca-choice="1"]').click();
  await page.waitForFunction(() => {
    const transcript = document.querySelector('[data-cattca] .rmd-cattca-transcript');
    return transcript?.textContent?.includes('又是阳光明媚的一天') === true;
  });
  assert.match(await page.locator('[data-cattca] .rmd-cattca-transcript').textContent(), /你选择了：起床/);
  assert.equal(await page.locator('[data-cattca-choice]').count(), 3);

  await page.locator('[data-cattca-choice="0"]').click();
  await page.waitForFunction(() => document.querySelectorAll('[data-cattca-choice]').length === 2);
  assert.match(await page.locator('[data-cattca] .rmd-cattca-transcript').textContent(), /屋顶上镶着一层金色的边/);

  await page.locator('[data-cattca-choice="0"]').click();
  await page.waitForFunction(() => document.querySelector('[data-cattca]')?.getAttribute('data-cattca-state') === 'finished');
  assert.match(await page.locator('[data-cattca] .rmd-cattca-transcript').textContent(), /决定把它好好用掉/);
  await page.locator('[data-cattca] .rmd-cattca-end').waitFor({ state: 'visible' });

  await page.locator('[data-cattca-restart]').click();
  await page.waitForFunction(() => {
    const root = document.querySelector('[data-cattca]');
    const transcript = root?.querySelector('.rmd-cattca-transcript');
    return root?.getAttribute('data-cattca-state') === 'choice'
      && root.querySelectorAll('[data-cattca-choice]').length === 2
      && !transcript?.textContent?.includes('又是阳光明媚的一天');
  });

  assert.equal(await page.evaluate(toggle('Lock story')), true);
  assert.equal(await page.locator('[data-cattca-choice="0"]').isDisabled(), true);
  assert.equal(await page.evaluate(toggle('Lock story')), true);
  assert.equal(await page.locator('[data-cattca-choice="0"]').isEnabled(), true);

  assert.equal(await page.evaluate(toggle('Show debug state')), true);
  await page.locator('[data-cattca] .rmd-cattca-debug').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(toggle('Show debug state')), true);

  assert.equal(await page.evaluate(toggle('Show story')), true);
  await page.locator('[data-cattca]').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(toggle('Show story')), true);
  await page.locator('[data-cattca]').waitFor({ state: 'visible' });

  assert.deepEqual(consoleErrors, []);
  console.log('Browser smoke test passed: hydration, choices, endings, restart, lock, debug and hide/show.');
} finally {
  await browser.close();
}
