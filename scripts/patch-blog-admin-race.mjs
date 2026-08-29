import fs from 'node:fs';
const path = 'client/src/components/admin/BlogAdmin.tsx';
let source = fs.readFileSync(path, 'utf8');
const before = `  const updateDraft = (patch: Partial<BlogPost>) => {\n    setDraft((current) => ({ ...current, ...patch }));\n    setSaveState("unsaved");\n  };\n\n  const updateLanguageContent = (value: string) => {\n    setDraft((current) => ({ ...current, content: { ...current.content, [language]: sanitizeHtml(value) } }));\n    setSaveState("unsaved");\n  };`;
const after = `  const updateDraft = (patch: Partial<BlogPost>) => {\n    setDraft((current) => {\n      const next = { ...current, ...patch };\n      currentDraftRef.current = next;\n      return next;\n    });\n    setSaveState("unsaved");\n  };\n\n  const updateLanguageContent = (value: string) => {\n    const sanitizedValue = sanitizeHtml(value);\n    setDraft((current) => {\n      const next = { ...current, content: { ...current.content, [language]: sanitizedValue } };\n      currentDraftRef.current = next;\n      return next;\n    });\n    setSaveState("unsaved");\n  };`;
if (!source.includes(before)) throw new Error('Expected draft update block was not found');
source = source.replace(before, after);
fs.writeFileSync(path, source);
