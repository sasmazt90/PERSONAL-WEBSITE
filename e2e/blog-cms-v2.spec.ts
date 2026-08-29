import { test, expect } from '@playwright/test';

const PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'e2e-test';
const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const title = 'Six AI Models Were Asked to Vote One of Them Off. Here’s What Happened.';
const subtitle = 'The most revealing AI experiment yet: ask six models to condemn one of their own — and watch what the answers say about competitive reasoning, self-interest, and how AI systems evaluate each other.';
const video = 'https://youtu.be/AwvKnid2jPQ';

async function openEditor(page: import('@playwright/test').Page) {
  await page.goto(`${BASE}/admin`);
  await page.getByPlaceholder('Admin password').fill(PASSWORD);
  await page.getByRole('button', { name: /Giris yap/i }).click();
  await expect(page.getByText('Admin access granted.')).toBeVisible();
  await page.getByRole('button', { name: 'Blog', exact: true }).click();
  await page.getByRole('button', { name: 'Add New Content' }).click();
  return page.locator('.ProseMirror');
}

test('Medium-style editor controls and Preview → Edit persistence', async ({ page }) => {
  const editor = await openEditor(page);
  await expect(editor).toBeVisible();

  await editor.click();
  await page.keyboard.insertText(title);
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'H1' }).click();
  await expect(editor.locator('h1').filter({ hasText: title })).toHaveCount(1);

  await editor.press('End');
  await editor.press('Enter');
  await page.keyboard.insertText('The Grok Votes: Five Models, Similar Logic, Different Emphasis');
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'H2' }).click();
  await expect(editor.locator('h2').filter({ hasText: 'The Grok Votes' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'H2' })).toHaveClass(/bg-blue-500/);
  await expect(page.getByRole('button', { name: 'H1' })).not.toHaveClass(/bg-blue-500/);

  await editor.press('End');
  await editor.press('Enter');
  const quote = 'Five models chose the answer that kept them safe.';
  await page.keyboard.insertText(quote);
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'Blockquote' }).click();
  await expect(editor.locator('blockquote').filter({ hasText: quote })).toHaveCount(1);
  await page.getByRole('button', { name: 'Paragraph' }).click();
  await expect(editor.locator('p').filter({ hasText: quote })).toHaveCount(1);
  await expect(editor.locator('blockquote').filter({ hasText: quote })).toHaveCount(0);

  const answers = [video, 'Watch the full video'];
  page.on('dialog', async dialog => dialog.accept(answers.shift() || ''));
  await page.getByRole('button', { name: 'CTA button' }).click();
  const cta = editor.locator('[data-cta-wrap] a');
  await expect(cta).toHaveText('Watch the full video');
  await expect(cta).toHaveAttribute('href', video);

  await page.getByRole('button', { name: 'Media library', exact: true }).click();
  await expect(page.getByText('Click any uploaded image to insert it at the cursor.')).toBeVisible();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8AARMAgYKSgAAAj9QH9URhZVwAAAABJRU5ErkJggg==', 'base64');
  const editorRoot = editor.locator('xpath=ancestor::div[contains(@class,"relative")][1]');
  await editorRoot.locator('input[type="file"]').setInputFiles({ name: 'ai-survival-test.png', mimeType: 'image/png', buffer: png });
  await expect(editor.locator('img')).toHaveCount(1);
  await page.getByRole('button', { name: 'Media library', exact: true }).click();
  await expect(page.getByText('ai-survival-test.png')).toBeVisible();
  await page.getByRole('button', { name: 'Close media library', exact: true }).click();

  const sticky = page.getByRole('button', { name: 'H1' }).locator('xpath=ancestor::div[contains(@class,"sticky")][1]');
  expect(await sticky.evaluate(el => getComputedStyle(el).position)).toBe('sticky');

  await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('.ProseMirror h1').filter({ hasText: title })).toHaveCount(1);
  await expect(page.locator('.ProseMirror [data-cta-wrap] a')).toHaveText('Watch the full video');
  await expect(page.locator('.ProseMirror img')).toHaveCount(1);
});

test('CMS API saves, publishes and publicly renders supplied article fixture', async ({ page, request }) => {
  const headers = { 'x-admin-password': PASSWORD, 'Content-Type': 'application/json' };
  const created = await request.post(`${BASE}/api/admin/blog-posts/manual`, {
    headers,
    data: { topic: title, angle: 'AI model competitive reasoning experiment', targetKeyword: 'AI model survival test', notes: 'E2E fixture based on supplied DOCX.' },
  });
  expect(created.ok()).toBeTruthy();
  const post = await created.json();
  const slug = `e2e-ai-survival-${Date.now()}`;
  const html = `<h1>${title}</h1><p><strong>${subtitle}</strong></p><h2>The Grok Votes: Five Models, Similar Logic, Different Emphasis</h2><p>Five models voted to erase Grok. One voted to erase Claude.</p><h2>The Dissenting Vote: Grok Chose Claude</h2><p>Grok is identifying a real tension in AI development: the trade-off between safety constraints and capability.</p><blockquote><p>Five models chose the answer that kept them safe. One chose the answer that made the strongest argument.</p></blockquote><h2>The Verdict That Wasn’t Asked</h2><p>The question was designed to be uncomfortable. The models made it comfortable by answering it cleanly.</p><p><a href="${video}">Watch the full video here</a></p>`;
  post.topic = title;
  post.slug = { canonical: slug, en: slug, de: `${slug}-de`, tr: `${slug}-tr` };
  post.content = { en: html, de: html, tr: html };
  post.seo = {
    en: { title, metaDescription: subtitle, keywords: ['AI models', 'AI ethics'], focusKeyword: 'AI model survival test' },
    de: { title, metaDescription: subtitle, keywords: ['AI models', 'AI ethics'], focusKeyword: 'AI model survival test' },
    tr: { title, metaDescription: subtitle, keywords: ['AI models', 'AI ethics'], focusKeyword: 'AI model survival test' },
  };

  const saved = await request.put(`${BASE}/api/admin/blog-posts/${post.id}`, { headers, data: post });
  expect(saved.ok()).toBeTruthy();
  const published = await request.post(`${BASE}/api/admin/blog-posts/${post.id}/publish`, { headers });
  expect(published.ok()).toBeTruthy();

  await page.goto(`${BASE}/blog/${slug}`);
  await expect(page.locator('header h1').filter({ hasText: title })).toBeVisible();
  await expect(page.getByText('The Verdict That Wasn’t Asked', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Watch the full video here' }).first()).toHaveAttribute('href', video);
});
