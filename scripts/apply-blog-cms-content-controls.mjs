import fs from 'node:fs';

function replaceOrFail(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label} anchor not found`);
  return source.replace(before, after);
}

{
  const path = 'client/src/components/admin/BlogAdmin.tsx';
  let source = fs.readFileSync(path, 'utf8');
  source = replaceOrFail(
    source,
`    const uploaded = await uploadBlogVisual(persisted.id, visual.id, file, password);
    const latest = currentDraftRef.current;
    const contentChangedDuringUpload = fingerprint({ ...latest, visuals: withVisual.visuals }) !== fingerprint(withVisual);
    const merged = contentChangedDuringUpload
      ? { ...latest, visuals: uploaded.visuals }
      : uploaded;`,
`    const uploaded = await uploadBlogVisual(persisted.id, visual.id, file, password);
    const latest = currentDraftRef.current;
    const contentChangedDuringUpload = fingerprint({ ...latest, visuals: withVisual.visuals }) !== fingerprint(withVisual);
    // Never replace the live editor state with a server response that may have been created
    // before the latest Tiptap transaction. Only merge the persisted visual payload back in.
    const merged = { ...latest, visuals: uploaded.visuals, updatedAt: uploaded.updatedAt };`,
    'Inline upload merge',
  );
  fs.writeFileSync(path, source);
}

{
  const path = 'client/src/components/admin/RichTextEditor.tsx';
  let source = fs.readFileSync(path, 'utf8');
  source = replaceOrFail(
    source,
`    setUploading(true);
    try {
      const insertionPoint = editor.state.selection.to;
      const result = await onUploadImage(file);
      editor.chain().focus().setTextSelection(insertionPoint).insertContent({ type: "image", attrs: { src: result.url, alt: result.alt || file.name.replace(/\\.[^.]+$/, ""), visualId: result.visualId || null } }).run();`,
`    setUploading(true);
    try {
      // Flush the exact editor HTML into the draft synchronously before an async upload starts.
      // This prevents a stale server snapshot from dropping CTA/table/link nodes while media is uploading.
      onChange(sanitizeHtml(editor.getHTML()));
      const insertionPoint = editor.state.selection.to;
      const result = await onUploadImage(file);
      const safeInsertionPoint = Math.min(insertionPoint, editor.state.doc.content.size);
      editor.chain().focus().setTextSelection(safeInsertionPoint).insertContent({ type: "image", attrs: { src: result.url, alt: result.alt || file.name.replace(/\\.[^.]+$/, ""), visualId: result.visualId || null } }).run();`,
    'RichText upload flush',
  );
  fs.writeFileSync(path, source);
}

{
  const path = 'e2e/blog-cms.spec.ts';
  let source = fs.readFileSync(path, 'utf8');
  source = source.replace(
`  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'H2' }).click();`,
`  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'H2' }).click();`,
  );
  source = source.replace(
`  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Blockquote' }).click();`,
`  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Blockquote' }).click();`,
  );
  fs.writeFileSync(path, source);
}

console.log('Media uploads now preserve the live editor state, and CMS E2E keeps the caret at the natural insertion point.');
