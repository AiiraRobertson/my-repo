import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await page.goto('https://playwright.dev/docs/intro');
  await page.getByRole('button', { name: 'Node.js' }).click();
  await page.getByRole('link', { name: 'Canary releases' }).click();
  await page.getByRole('link', { name: 'Setting up CI' }).click();
  await page.getByRole('link', { name: 'Generating tests' }).click();
  await page.getByRole('link', { name: 'Writing tests', exact: true }).click();
  await page.getByRole('button', { name: 'Playwright Test' }).click();
  await page.getByRole('button', { name: 'Playwright Test' }).click();
});