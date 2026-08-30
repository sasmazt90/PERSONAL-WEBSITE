import fs from 'node:fs';

const path = 'client/src/components/admin/RichTextEditor.tsx';
let source = fs.readFileSync(path, 'utf8');

const attrBefore = `      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
        renderHTML: () => ({}),
      },
      textColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || null,
        renderHTML: () => ({}),
      },`;
const attrAfter = `      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor || element.getAttribute("data-cell-background") || null,
        renderHTML: (attributes: { backgroundColor?: string | null }) => attributes.backgroundColor ? { "data-cell-background": attributes.backgroundColor } : {},
      },
      textColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || element.getAttribute("data-cell-text-color") || null,
        renderHTML: (attributes: { textColor?: string | null }) => attributes.textColor ? { "data-cell-text-color": attributes.textColor } : {},
      },`;

const cellRenderBefore = `  renderHTML({ HTMLAttributes }) {
    const { backgroundColor, textColor, style, ...attributes } = HTMLAttributes as Record<string, string | null>;
    return ["td", mergeAttributes(attributes, { style: \`${style ? \`${style};\` : ""}\${cellStyle({ backgroundColor, textColor })}\` }), 0];
  },`;
const cellRenderAfter = `  renderHTML({ HTMLAttributes }) {
    const values = HTMLAttributes as Record<string, string | null>;
    const backgroundColor = values["data-cell-background"] || null;
    const textColor = values["data-cell-text-color"] || null;
    const { style, ...attributes } = values;
    return ["td", mergeAttributes(attributes, { style: \`${style ? \`${style};\` : ""}\${cellStyle({ backgroundColor, textColor })}\` }), 0];
  },`;
const headerRenderBefore = `  renderHTML({ HTMLAttributes }) {
    const { backgroundColor, textColor, style, ...attributes } = HTMLAttributes as Record<string, string | null>;
    return ["th", mergeAttributes(attributes, { style: \`${style ? \`${style};\` : ""}\${cellStyle({ backgroundColor, textColor })};font-weight:700\` }), 0];
  },`;
const headerRenderAfter = `  renderHTML({ HTMLAttributes }) {
    const values = HTMLAttributes as Record<string, string | null>;
    const backgroundColor = values["data-cell-background"] || null;
    const textColor = values["data-cell-text-color"] || null;
    const { style, ...attributes } = values;
    return ["th", mergeAttributes(attributes, { style: \`${style ? \`${style};\` : ""}\${cellStyle({ backgroundColor, textColor })};font-weight:700\` }), 0];
  },`;

if ((source.match(new RegExp(attrBefore.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 2) throw new Error('Expected two table attribute blocks');
source = source.replace(attrBefore, attrAfter).replace(attrBefore, attrAfter);
if (!source.includes(cellRenderBefore) || !source.includes(headerRenderBefore)) throw new Error('Table render anchors not found');
source = source.replace(cellRenderBefore, cellRenderAfter).replace(headerRenderBefore, headerRenderAfter);

fs.writeFileSync(path, source);
console.log('Table cell color attributes now serialize into editor and published HTML.');
