import fs from 'node:fs';

function replaceOnce(path, before, after) {
  const source = fs.readFileSync(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Missing patch target in ${path}`);
  fs.writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'client/src/components/admin/RichTextEditor.tsx',
  `      <input type="color" aria-label={label} defaultValue={value} onChange={(event) => onChange(event.target.value)} className="h-4 w-4 border-0 bg-transparent p-0" />\n    </label>\n  );\n}\n\nfunction escapeHtml`,
  `      <input type="color" aria-label={label} defaultValue={value} onInput={(event) => onChange((event.currentTarget as HTMLInputElement).value)} className="h-4 w-4 border-0 bg-transparent p-0" />\n    </label>\n  );\n}\n\nfunction escapeHtml`,
);

replaceOnce(
  'e2e/blog-cms.spec.ts',
  `  await expect(editor.locator('table tr')).toHaveCount(5);\n  await expect(editor.locator('table tr').first().locator('th')).toHaveCount(6);\n  await page.getByLabel('Cell background').fill('#334155');\n  await page.getByLabel('Cell text color').fill('#ffffff');\n  await expect(editor.locator('table td').first()).toHaveAttribute('style', /background-color/);`,
  `  await expect(editor.locator('table tr')).toHaveCount(5);\n  await expect(editor.locator('table tr').first().locator('th')).toHaveCount(6);\n  const styledCell = editor.locator('table td').first();\n  await styledCell.click();\n  await page.getByLabel('Cell background').fill('#334155');\n  await styledCell.click();\n  await page.getByLabel('Cell text color').fill('#ffffff');\n  await expect(styledCell).toHaveAttribute('style', /background-color/);\n  await expect(styledCell).toHaveAttribute('style', /color/);`,
);

console.log('Table cell color regression patch applied.');
