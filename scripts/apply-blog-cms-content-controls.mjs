import fs from 'node:fs';

{
  const path = 'client/src/components/admin/RichTextEditor.tsx';
  let source = fs.readFileSync(path, 'utf8');
  const before = `  const insertTable = () => {
    const rows = Math.max(1, Math.min(50, Math.round(tableRows || 1)));
    const cols = Math.max(1, Math.min(20, Math.round(tableColumns || 1)));
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
    setTableOpen(true);
  };`;
  const after = `  const insertTable = () => {
    const rows = Math.max(1, Math.min(50, Math.round(tableRows || 1)));
    const cols = Math.max(1, Math.min(20, Math.round(tableColumns || 1)));
    // Toolbar clicks can leave a NodeSelection on an atom such as CTA or image.
    // Collapse to the end of that selection so table insertion never replaces
    // the selected CTA/image node.
    const insertionPoint = Math.min(editor.state.selection.to, editor.state.doc.content.size);
    editor.chain().focus().setTextSelection(insertionPoint).insertTable({ rows, cols, withHeaderRow }).run();
    setTableOpen(true);
  };`;

  if (source.includes(before)) {
    source = source.replace(before, after);
    fs.writeFileSync(path, source);
    console.log('Applied atom-safe table insertion.');
  } else if (source.includes('setTextSelection(insertionPoint).insertTable')) {
    console.log('Atom-safe table insertion already applied.');
  } else {
    throw new Error('Safe table insertion anchor not found');
  }
}

console.log('CMS content controls patch completed.');
