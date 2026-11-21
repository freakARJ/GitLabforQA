const { test, expect } = require('@playwright/test');

const practice = (page) => page.getByRole('button', { name: /4\. Practice/ });

async function finishLessons(page) {
  await page.goto('/');
  for (let i = 0; i < 7; i++) {
    await page.getByRole('button', { name: 'Next →' }).click();
  }
  await expect(page.locator('header')).toContainText('Lessons 8/8');
}

async function snap(page, labels) {
  for (const label of labels) {
    await page.locator('.lego', { hasText: label }).first().click();
  }
}

async function solveModule1(page) {
  await snap(page, ['git clone', 'git checkout -b qa-login', 'git add login.spec.js', 'git commit -m', 'git push origin qa-login']);
  await expect(page.locator('#app')).toContainText('Puzzle assembled');
}

async function solveModule2(page) {
  await page.getByRole('button', { name: /2 · Pull Requests/ }).click();
  await snap(page, ['git fetch origin pull/42/head:pr-42', 'git switch pr-42', 'Files Changed']);
  await page.locator('.diff-line', { hasText: 'disabled={false}' }).click();
  await expect(page.locator('#app')).toContainText('Bug caught');
  await expect(page.locator('#app')).toContainText('Merge BLOCKED');
}

async function solveModule3(page) {
  await page.getByRole('button', { name: /3 · CI\/CD robot/ }).click();
  await snap(page, ['Trigger: workflow_dispatch', 'npx playwright test', 'Console Error Log', 'Download:']);
  await page.locator('[data-a=art]').click();
  await expect(page.locator('#app')).toContainText('Why it matters');
}

test('page loads with no JavaScript errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Git & CI/CD Lab');
  expect(errors).toEqual([]);
});

test('practice games stay locked until all lessons are visited', async ({ page }) => {
  await page.goto('/');
  await practice(page).click();
  await expect(page.locator('#app')).toContainText('Finish the lessons first');
});

test('branch lab: create a branch, commit, then merge into main', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Branch Lab/ }).click();
  await page.locator('#bn').fill('qa-login');
  await page.getByRole('button', { name: /New branch/ }).click();
  await expect(page.locator('svg')).toContainText('HEAD → qa-login');
  await page.getByRole('button', { name: /Commit on/ }).click();
  await page.locator('#sw').selectOption('main');
  await page.getByRole('button', { name: 'Switch' }).click();
  await page.getByRole('button', { name: /Merge into main/ }).click();
  await expect(page.locator('#app')).toContainText('Merged!');
  await expect(page.locator('svg')).toContainText('⑂');
});

test('CI/CD tab: pipeline goes red or green and sample files are shown', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /3\. CI\/CD/ }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: /Next stage/ }).click();
  }
  await expect(page.locator('#app')).toContainText('Build FAILED');
  await page.locator('input[type=checkbox]').uncheck();
  await expect(page.locator('#app')).toContainText('Build passed');
  await page.getByRole('button', { name: 'nightly.yml' }).click();
  await expect(page.locator('pre')).toContainText('workflow_dispatch');
  await page.getByRole('button', { name: 'playwright.config.js' }).click();
  await expect(page.locator('pre')).toContainText('defineConfig');
});

test('puzzle 1: a wrong order gets a friendly explanation', async ({ page }) => {
  await finishLessons(page);
  await practice(page).click();
  await snap(page, ['git push origin qa-login']);
  await expect(page.locator('#app')).toContainText('Push uploads commits');
  await solveModule1(page);
});

test('all three puzzles can be completed and the certificate appears', async ({ page }) => {
  await finishLessons(page);
  await practice(page).click();
  await solveModule1(page);
  await solveModule2(page);
  await solveModule3(page);
  await expect(page.locator('#app')).toContainText('QA Git Certified');
});
