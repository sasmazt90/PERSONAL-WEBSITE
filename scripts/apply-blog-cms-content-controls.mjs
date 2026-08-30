import fs from 'node:fs';

const path = 'e2e/blog-cms.spec.ts';
let source = fs.readFileSync(path, 'utf8');

const before = `  const dialogAnswers = [videoUrl, 'Watch the full video'];\n  page.on('dialog', async (dialog) => {\n    await dialog.accept(dialogAnswers.shift() || '');\n  });\n  await page.getByRole('button', { name: 'CTA button' }).click();`;

const after = `  page.once('dialog', async (dialog) => dialog.accept(videoUrl));\n  const ctaClick = page.getByRole('button', { name: 'CTA button' }).click();\n  await ctaClick;\n  page.once('dialog', async (dialog) => dialog.accept('Watch the full video'));`;

if (!source.includes(before)) throw new Error('CTA dialog test anchor not found');
source = source.replace(before, after);

fs.writeFileSync(path, source);
console.log('CMS E2E now uses one-shot dialog handlers so image-link prompts are not double-handled.');
