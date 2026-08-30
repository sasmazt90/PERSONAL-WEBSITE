import fs from 'node:fs';

const path = 'e2e/blog-cms.spec.ts';
let source = fs.readFileSync(path, 'utf8');

source = source.replace(
`  await editor.locator('h1').click();\n  await page.keyboard.press('End');\n  await page.keyboard.press('Enter');`,
`  await page.keyboard.press('Control+End');\n  await page.keyboard.press('Enter');`,
);
source = source.replace(
`  await editor.locator('h2').click();\n  await page.keyboard.press('End');\n  await page.keyboard.press('Enter');`,
`  await page.keyboard.press('Control+End');\n  await page.keyboard.press('Enter');`,
);

fs.writeFileSync(path, source);
console.log('CMS E2E now uses Control+End so wrapped headings are never split by visual-line cursor movement.');
