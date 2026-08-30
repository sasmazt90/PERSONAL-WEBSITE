import fs from 'node:fs';

const path = 'client/src/components/admin/BlogAdmin.tsx';
let source = fs.readFileSync(path, 'utf8');

const previewAnchor = `  const handlePreview = async () => {\n    setBusy(true);\n    setError(null);\n    try {\n      const saved = await persistSnapshot(currentDraftRef.current, true);\n      currentDraftRef.current = saved;\n      setDraft(saved);\n      onPreview(saved);\n    } catch {\n      // error already shown\n    } finally {\n      setBusy(false);\n    }\n  };`;

const replacement = `${previewAnchor}\n\n  const handleBack = async () => {\n    const current = currentDraftRef.current;\n    if (fingerprint(current) === lastSavedFingerprintRef.current) {\n      onBack();\n      return;\n    }\n    setBusy(true);\n    setError(null);\n    try {\n      const saved = await persistSnapshot(current, true);\n      currentDraftRef.current = saved;\n      setDraft(saved);\n      onBack();\n    } catch {\n      // Stay in the editor when persistence fails so unsaved content is not discarded.\n    } finally {\n      setBusy(false);\n    }\n  };`;

if (!source.includes(previewAnchor)) throw new Error('Preview anchor not found');
source = source.replace(previewAnchor, replacement);

const buttonBefore = `<button type="button" onClick={onBack} className="text-xs font-semibold text-slate-400 hover:text-white">← Back to Blog Content</button>`;
const buttonAfter = `<button type="button" onClick={() => void handleBack()} disabled={busy} className="text-xs font-semibold text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50">← Back to Blog Content</button>`;
if (!source.includes(buttonBefore)) throw new Error('Back button anchor not found');
source = source.replace(buttonBefore, buttonAfter);

fs.writeFileSync(path, source);
console.log('Back navigation now persists unsaved draft content before leaving the editor.');
