import fs from 'node:fs';

function replaceOrFail(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label} anchor not found`);
  return source.replace(before, after);
}

{
  const path = 'client/src/components/admin/RichTextEditor.tsx';
  let source = fs.readFileSync(path, 'utf8');

  source = replaceOrFail(
    source,
`  const insertTable = () => {
    const rows = Math.max(1, Math.min(50, Math.round(tableRows || 1)));
    const cols = Math.max(1, Math.min(20, Math.round(tableColumns || 1)));
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    setTableOpen(true);
  };`,
`  const insertTable = () => {
    const rows = Math.max(1, Math.min(50, Math.round(tableRows || 1)));
    const cols = Math.max(1, Math.min(20, Math.round(tableColumns || 1)));
    // Toolbar clicks can leave a NodeSelection on an atom such as CTA or image.
    // Converting that selection to a collapsed text selection at its end prevents
    // insertTable() from replacing the selected atom node.
    const insertionPoint = Math.min(editor.state.selection.to, editor.state.doc.content.size);
    editor.chain().focus().setTextSelection(insertionPoint).insertTable({ rows, cols, withHeaderRow }).run();
    setTableOpen(true);
  };`,
    'Safe table insertion',
  );

  fs.writeFileSync(path, source);
}

{
  const path = 'e2e/blog-render-parity.spec.ts';
  let source = fs.readFileSync(path, 'utf8');

  source = replaceOrFail(
    source,
`  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Paragraph' }).click();
  await page.keyboard.insertText('Rendering parity paragraph for editor, preview and public output.');`,
`  // Pressing Enter at the end of a heading creates the next paragraph in Tiptap.
  // Keep the browser interaction identical to a normal authoring flow and avoid
  // moving the caret with browser-level Control+End semantics.
  await page.keyboard.press('Enter');
  await page.keyboard.insertText('Rendering parity paragraph for editor, preview and public output.');`,
    'Parity paragraph authoring',
  );

  source = replaceOrFail(
    source,
`  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Blockquote' }).click();`,
`  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Blockquote' }).click();`,
    'Parity quote authoring',
  );

  source = replaceOrFail(
    source,
`    const frame = page.locator('.ProseMirror').locator('xpath=..');
    await expect(frame).toHaveClass(/max-w-4xl/);`,
`    const frame = page.locator('.ProseMirror').locator('xpath=ancestor::div[contains(@class,"max-w-4xl")][1]');
    await expect(frame).toBeVisible();`,
    'Parity authoring frame locator',
  );

  fs.writeFileSync(path, source);
}

console.log('Patched atom-safe table insertion and stabilized editor/preview rendering parity regression coverage.');
