import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.goto('http://127.0.0.1:5500/Html/distrohome.html');
  await page.getByRole('button', { name: 'Upload / My Dashboard' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.goto('http://127.0.0.1:5500/Html/distrohome.html');
});