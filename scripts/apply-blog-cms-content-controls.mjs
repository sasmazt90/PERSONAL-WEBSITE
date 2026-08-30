import fs from 'node:fs';

const path = 'e2e/blog-cms.spec.ts';
let source = fs.readFileSync(path, 'utf8');

const before = `  const dialogAnswers = [videoUrl, 'Watch the full video'];\n  page.on('dialog', async (dialog) => {\n    await dialog.accept(dialogAnswers.shift() || '');\n  });\n  await page.getByRole('button', { name: 'CTA button' }).click();`;

const after = `  const ctaDialogAnswers = [videoUrl, 'Watch the full video'];\n  const ctaDialogHandler = async (dialog: import('@playwright/test').Dialog) => {\n    await dialog.accept(ctaDialogAnswers.shift() || '');\n  };\n  page.on('dialog', ctaDialogHandler);\n  await page.getByRole('button', { name: 'CTA button' }).click();\n  page.off('dialog', ctaDialogHandler);`;

if (!source.includes(before)) throw new Error('CTA dialog test anchor not found');
source = source.replace(before, after);

fs.writeFileSync(path, source);
console.log('CMS E2E now removes the CTA dialog handler before testing image-link prompts.');
