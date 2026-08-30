import fs from 'node:fs';

const path = 'client/src/components/admin/RichTextEditor.tsx';
let source = fs.readFileSync(path, 'utf8');
const before = `<input type="color" aria-label={label} defaultValue={value} onChange={(event) => onChange(event.target.value)} className="h-4 w-4 border-0 bg-transparent p-0" />`;
const after = `<input type="color" aria-label={label} defaultValue={value} onInput={(event) => onChange((event.currentTarget as HTMLInputElement).value)} onChange={(event) => onChange(event.target.value)} className="h-4 w-4 border-0 bg-transparent p-0" />`;
const marker = 'function CellColorPicker';
const markerIndex = source.indexOf(marker);
if (markerIndex < 0) throw new Error('CellColorPicker not found');
const prefix = source.slice(0, markerIndex);
let tail = source.slice(markerIndex);
if (!tail.includes(before)) throw new Error('Cell color input target not found');
tail = tail.replace(before, after);
source = prefix + tail;
if (!source.includes('function CellColorPicker') || !source.slice(source.indexOf(marker)).includes('onInput={(event) => onChange')) throw new Error('Cell color onInput patch did not apply');
fs.writeFileSync(path, source);
console.log('Cell color input now responds to input and change events.');
