import { chromium } from 'playwright';
import path from 'path';

const artifactsDir = 'C:/Users/ratho/.gemini/antigravity-ide/brain/2c15e93e-deb8-4c05-96c3-e68d20874a0b';

async function run() {
  console.log('Starting QA E2E Test Suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    // 1. Login Page
    console.log('Navigating to Login Page...');
    await page.goto('http://localhost:5173/#/login');
    await page.waitForSelector('#email');
    await page.fill('#email', 'balamani212006@gmail.com');
    await page.fill('#password', 'Pandu@1108');
    
    console.log('Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for Dashboard
    await page.waitForURL('http://localhost:5173/#/', { timeout: 15000 });
    console.log('Logged in successfully!');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactsDir, 'lms_dashboard.png') });
    console.log('Dashboard screenshot captured.');

    // 2. Leaderboard
    console.log('Navigating to Leaderboard...');
    await page.goto('http://localhost:5173/#/leaderboard');
    await page.waitForSelector('h1:has-text("Leaderboard")');
    await page.waitForTimeout(2000);

    // Test weekly tab
    console.log('Clicking Weekly tab...');
    await page.click('button:has-text("Weekly")');
    await page.waitForTimeout(1000);

    // Test monthly tab
    console.log('Clicking Monthly tab...');
    await page.click('button:has-text("Monthly")');
    await page.waitForTimeout(1000);

    // Test All-Time tab
    console.log('Clicking All-Time tab...');
    await page.click('button:has-text("All-Time")');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(artifactsDir, 'lms_leaderboard.png') });
    console.log('Leaderboard screenshot captured.');

    // 3. Lecture Page Week 1
    console.log('Navigating to Course Python Week 1...');
    await page.goto('http://localhost:5173/#/course/python/lecture/0');
    await page.waitForSelector('span:has-text("What is Python?")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactsDir, 'lms_lecture_page.png') });
    console.log('Lecture page screenshot captured.');

    // 4. Capstone Project Workflow (Week 14 redirects here)
    console.log('Navigating to Course Python Capstone (Week 14 / Lecture 13)...');
    await page.goto('http://localhost:5173/#/course/python/lecture/13');
    await page.waitForSelector('h1:has-text("Select Your Final Project")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactsDir, 'lms_project_selection.png') });

    // Select first project
    console.log('Selecting project "Student Management System"...');
    await page.click('button:has-text("Select Project")');
    await page.waitForTimeout(1500);

    // Click Configure Requirements
    console.log('Clicking Configure Requirements...');
    await page.click('button:has-text("Configure Requirements")');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactsDir, 'lms_project_requirements.png') });

    // Click Launch Workspace
    console.log('Clicking Launch Workspace...');
    await page.click('button:has-text("Launch Workspace")');
    await page.waitForTimeout(4000);

    console.log('Current URL after launch:', page.url());
    await page.screenshot({ path: path.join(artifactsDir, 'lms_project_workspace.png') });
    console.log('Workspace screenshot captured.');

    console.log('QA E2E Test Suite completed successfully!');
  } catch (err) {
    console.error('Test execution failed with error:', err);
    await page.screenshot({ path: path.join(artifactsDir, 'lms_test_failure.png') });
  } finally {
    await browser.close();
  }
}

run();
