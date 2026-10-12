import { chromium } from 'playwright';

const email = `colortest_${Date.now()}@example.com`;
const password = "TestPass123!";

const reg = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name: "Color Test" })
});
const regJson = await reg.json();
if (!reg.ok) {
  console.log('register failed', reg.status, JSON.stringify(regJson));
  process.exit(1);
}
const token = regJson.access_token;
console.log('registered, got token:', !!token);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1536, height: 950 } });
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(String(err)));

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.evaluate((t) => { localStorage.setItem('fa_token', t); }, token);
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/private/tmp/claude-501/-Users-nishithakrishna-Desktop-projects-untitled-folder-LMS/81442342-0905-4405-871f-81fef8b332dc/scratchpad/dashboard-actual.png', fullPage: true });
console.log('errors:', JSON.stringify(errors));
await browser.close();
