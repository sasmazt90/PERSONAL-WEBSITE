import { test, expect } from '@playwright/test';

const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'e2e-test';
const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

async function loginAndOpenBlog(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/admin`);
  await page.getByPlaceholder('Admin password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /Giris yap/i }).click();
  await expect(page.getByText('Admin access granted.')).toBeVisible();
  await page.getByRole('button', { name: 'Blog', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add New Content' })).toBeVisible();
}

async function typographySnapshot(root: import('@playwright/test').Locator) {
  return root.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      color: style.color,
      fontWeight: style.fontWeight,
    };
  });
}

test('authoring canvas and preview use the same article rendering contract', async ({ page }) => {
  await loginAndOpenBlog(page);
  await page.getByRole('button', { name: 'Add New Content' }).click();

  const editor = page.locator('.ProseMirror');
  await expect(editor).toBeVisible();
  await expect(editor).toHaveClass(/blog-article-body/);

  await editor.click();
  await page.keyboard.insertText('Rendering parity headline');
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'H1' }).click();

  await editor.press('End');
  await editor.press('Enter');
  await page.keyboard.insertText('Rendering parity paragraph for editor, preview and public output.');

  await editor.press('End');
  await editor.press('Enter');
  await page.keyboard.insertText('Rendering parity quote.');
  await page.keyboard.press('Shift+Home');
  await page.getByRole('button', { name: 'Blockquote' }).click();

  const editorHeadingStyle = await typographySnapshot(editor.locator('h1'));
  const editorParagraphStyle = await typographySnapshot(editor.locator('p').first());
  const editorQuoteStyle = await typographySnapshot(editor.locator('blockquote'));

  await page.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByRole('heading', { name: 'Preview', exact: true })).toBeVisible();
  const previewBody = page.locator('article .blog-article-body');
  await expect(previewBody).toBeVisible();
  await expect(previewBody.locator('h1')).toHaveText('Rendering parity headline');
  await expect(previewBody).toContainText('Rendering parity paragraph');
  await expect(previewBody.locator('blockquote')).toContainText('Rendering parity quote');

  expect(await typographySnapshot(previewBody.locator('h1'))).toEqual(editorHeadingStyle);
  expect(await typographySnapshot(previewBody.locator('p').first())).toEqual(editorParagraphStyle);
  expect(await typographySnapshot(previewBody.locator('blockquote'))).toEqual(editorQuoteStyle);

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('.ProseMirror.blog-article-body h1')).toHaveText('Rendering parity headline');
});

test('published article body uses the same rendering class as editor and preview', async ({ page, request }) => {
  const headers = { 'x-admin-password': ADMIN_PASSWORD, 'Content-Type': 'application/json' };
  const manual = await request.post(`${BASE_URL}/api/admin/blog-posts/manual`, {
    headers,
    data: { topic: 'Rendering Contract Fixture', angle: 'E2E rendering parity', targetKeyword: 'rendering parity', notes: '' },
  });
  expect(manual.ok()).toBeTruthy();
  const post = await manual.json();
  const slug = `rendering-contract-${Date.now()}`;
  const content = '<h1>Rendering Contract Fixture</h1><p>Shared rendering contract body.</p><blockquote><p>Shared quote treatment.</p></blockquote>';
  post.slug = { canonical: slug, en: slug, de: `${slug}-de`, tr: `${slug}-tr` };
  post.content = { en: content, de: content, tr: content };
  post.seo = {
    en: { title: 'Rendering Contract Fixture', metaDescription: 'A rendering parity regression fixture for the blog CMS.', keywords: ['rendering parity'], focusKeyword: 'rendering parity' },
    de: { title: 'Rendering Contract Fixture', metaDescription: 'A rendering parity regression fixture for the blog CMS.', keywords: ['rendering parity'], focusKeyword: 'rendering parity' },
    tr: { title: 'Rendering Contract Fixture', metaDescription: 'A rendering parity regression fixture for the blog CMS.', keywords: ['rendering parity'], focusKeyword: 'rendering parity' },
  };

  const saved = await request.put(`${BASE_URL}/api/admin/blog-posts/${post.id}`, { headers, data: post });
  expect(saved.ok()).toBeTruthy();
  const published = await request.post(`${BASE_URL}/api/admin/blog-posts/${post.id}/publish`, { headers });
  expect(published.ok()).toBeTruthy();

  await page.goto(`${BASE_URL}/blog/${slug}`);
  const publicBody = page.locator('.blog-article-body');
  await expect(publicBody).toBeVisible();
  await expect(publicBody.locator('h1')).toHaveText('Rendering Contract Fixture');
  await expect(publicBody.locator('blockquote')).toContainText('Shared quote treatment.');
});
