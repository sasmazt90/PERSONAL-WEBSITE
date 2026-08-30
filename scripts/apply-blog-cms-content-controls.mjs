import fs from 'node:fs';

const path = 'client/src/components/admin/RichTextEditor.tsx';
let source = fs.readFileSync(path, 'utf8');

const insertTableBlock = `  const insertTable = () => {\n    const rows = Math.max(1, Math.min(50, Math.round(tableRows || 1)));\n    const cols = Math.max(1, Math.min(20, Math.round(tableColumns || 1)));\n    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();\n    setTableOpen(true);\n  };`;
const insertTableReplacement = `${insertTableBlock}\n\n  const setCurrentCellAttribute = (attribute: \"backgroundColor\" | \"textColor\", value: string) => {\n    const { state, view } = editor;\n    const { $from } = state.selection;\n    for (let depth = $from.depth; depth > 0; depth -= 1) {\n      const node = $from.node(depth);\n      if (node.type.name === \"tableCell\" || node.type.name === \"tableHeader\") {\n        const position = $from.before(depth);\n        view.dispatch(state.tr.setNodeMarkup(position, undefined, { ...node.attrs, [attribute]: value }));\n        view.focus();\n        return;\n      }\n    }\n  };`;
if (!source.includes(insertTableBlock)) throw new Error('Insert-table anchor not found');
source = source.replace(insertTableBlock, insertTableReplacement);

const bgBefore = `<CellColorPicker label="Cell background" value="#172033" onChange={(value) => editor.chain().focus().setCellAttribute("backgroundColor", value).run()} />`;
const bgAfter = `<CellColorPicker label="Cell background" value="#172033" onChange={(value) => setCurrentCellAttribute("backgroundColor", value)} />`;
const textBefore = `<CellColorPicker label="Cell text color" value="#f8fafc" onChange={(value) => editor.chain().focus().setCellAttribute("textColor", value).run()} icon={<Type size={14} />} />`;
const textAfter = `<CellColorPicker label="Cell text color" value="#f8fafc" onChange={(value) => setCurrentCellAttribute("textColor", value)} icon={<Type size={14} />} />`;
if (!source.includes(bgBefore) || !source.includes(textBefore)) throw new Error('Cell color control anchors not found');
source = source.replace(bgBefore, bgAfter).replace(textBefore, textAfter);

fs.writeFileSync(path, source);
console.log('Cell colors now update the current table cell with a direct ProseMirror transaction.');
