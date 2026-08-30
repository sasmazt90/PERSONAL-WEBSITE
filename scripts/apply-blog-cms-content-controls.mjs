import fs from 'node:fs';

const path = 'client/src/components/admin/RichTextEditor.tsx';
let source = fs.readFileSync(path, 'utf8');

const oldAttrs = [
  '      backgroundColor: {',
  '        default: null,',
  '        parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,',
  '        renderHTML: () => ({}),',
  '      },',
  '      textColor: {',
  '        default: null,',
  '        parseHTML: (element: HTMLElement) => element.style.color || null,',
  '        renderHTML: () => ({}),',
  '      },',
].join('\n');

const newAttrs = [
  '      backgroundColor: {',
  '        default: null,',
  '        parseHTML: (element: HTMLElement) => element.style.backgroundColor || element.getAttribute("data-cell-background") || null,',
  '        renderHTML: (attributes: { backgroundColor?: string | null }) => attributes.backgroundColor ? { "data-cell-background": attributes.backgroundColor } : {},',
  '      },',
  '      textColor: {',
  '        default: null,',
  '        parseHTML: (element: HTMLElement) => element.style.color || element.getAttribute("data-cell-text-color") || null,',
  '        renderHTML: (attributes: { textColor?: string | null }) => attributes.textColor ? { "data-cell-text-color": attributes.textColor } : {},',
  '      },',
].join('\n');

let attrCount = 0;
while (source.includes(oldAttrs)) {
  source = source.replace(oldAttrs, newAttrs);
  attrCount += 1;
}
if (attrCount !== 2) throw new Error(`Expected two table attribute blocks, patched ${attrCount}`);

const oldCellLines = [
  '  renderHTML({ HTMLAttributes }) {',
  '    const { backgroundColor, textColor, style, ...attributes } = HTMLAttributes as Record<string, string | null>;',
  '    return ["td", mergeAttributes(attributes, { style: `${style ? `${style};` : ""}${cellStyle({ backgroundColor, textColor })}` }), 0];',
  '  },',
].join('\n');
const newCellLines = [
  '  renderHTML({ HTMLAttributes }) {',
  '    const values = HTMLAttributes as Record<string, string | null>;',
  '    const backgroundColor = values["data-cell-background"] || null;',
  '    const textColor = values["data-cell-text-color"] || null;',
  '    const { style, ...attributes } = values;',
  '    return ["td", mergeAttributes(attributes, { style: `${style ? `${style};` : ""}${cellStyle({ backgroundColor, textColor })}` }), 0];',
  '  },',
].join('\n');
const oldHeaderLines = [
  '  renderHTML({ HTMLAttributes }) {',
  '    const { backgroundColor, textColor, style, ...attributes } = HTMLAttributes as Record<string, string | null>;',
  '    return ["th", mergeAttributes(attributes, { style: `${style ? `${style};` : ""}${cellStyle({ backgroundColor, textColor })};font-weight:700` }), 0];',
  '  },',
].join('\n');
const newHeaderLines = [
  '  renderHTML({ HTMLAttributes }) {',
  '    const values = HTMLAttributes as Record<string, string | null>;',
  '    const backgroundColor = values["data-cell-background"] || null;',
  '    const textColor = values["data-cell-text-color"] || null;',
  '    const { style, ...attributes } = values;',
  '    return ["th", mergeAttributes(attributes, { style: `${style ? `${style};` : ""}${cellStyle({ backgroundColor, textColor })};font-weight:700` }), 0];',
  '  },',
].join('\n');

if (!source.includes(oldCellLines)) throw new Error('Table cell renderer target not found');
if (!source.includes(oldHeaderLines)) throw new Error('Table header renderer target not found');
source = source.replace(oldCellLines, newCellLines).replace(oldHeaderLines, newHeaderLines);

fs.writeFileSync(path, source);
console.log('Table cell color attributes now serialize into editor and published HTML.');
