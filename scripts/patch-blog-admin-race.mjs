import fs from 'node:fs';

function patchFile(path, patches) {
  let source = fs.readFileSync(path, 'utf8');
  const replaceOnce = (before, after, label) => {
    if (source.includes(after)) return;
    if (!source.includes(before)) throw new Error(`Expected ${label} block was not found in ${path}`);
    source = source.replace(before, after);
  };
  for (const patch of patches) replaceOnce(patch.before, patch.after, patch.label);
  fs.writeFileSync(path, source);
}

patchFile('client/src/components/admin/BlogAdmin.tsx', [
  {
    label: 'save request ref',
    before: `  const currentDraftRef = useRef(draft);\n  const lastSavedFingerprintRef = useRef(fingerprint(post));`,
    after: `  const currentDraftRef = useRef(draft);\n  const lastSavedFingerprintRef = useRef(fingerprint(post));\n  const saveRequestRef = useRef(0);`,
  },
  {
    label: 'synchronous draft mutation',
    before: `  const updateDraft = (patch: Partial<BlogPost>) => {\n    setDraft((current) => {\n      const next = { ...current, ...patch };\n      currentDraftRef.current = next;\n      return next;\n    });\n    setSaveState("unsaved");\n  };\n\n  const updateLanguageContent = (value: string) => {\n    const sanitizedValue = sanitizeHtml(value);\n    setDraft((current) => {\n      const next = { ...current, content: { ...current.content, [language]: sanitizedValue } };\n      currentDraftRef.current = next;\n      return next;\n    });\n    setSaveState("unsaved");\n  };`,
    after: `  const updateDraft = (patch: Partial<BlogPost>) => {\n    const next = { ...currentDraftRef.current, ...patch };\n    currentDraftRef.current = next;\n    setDraft(next);\n    setSaveState("unsaved");\n  };\n\n  const updateLanguageContent = (value: string) => {\n    const sanitizedValue = sanitizeHtml(value);\n    const current = currentDraftRef.current;\n    const next = { ...current, content: { ...current.content, [language]: sanitizedValue } };\n    currentDraftRef.current = next;\n    setDraft(next);\n    setSaveState("unsaved");\n  };`,
  },
  {
    label: 'persist snapshot',
    before: `  const persistSnapshot = async (snapshot: BlogPost, surfaceErrors = false) => {\n    setSaveState("saving");\n    try {\n      const saved = await saveBlogPost({ ...snapshot, docReadyContent: buildDocReadyContent(snapshot) }, password);\n      lastSavedFingerprintRef.current = fingerprint(saved);\n      onSaved(saved);\n      if (fingerprint(currentDraftRef.current) === fingerprint(snapshot)) {\n        currentDraftRef.current = saved;\n        setDraft(saved);\n        setSaveState("saved");\n      } else {\n        setSaveState("unsaved");\n      }\n      return saved;\n    } catch (saveError) {\n      setSaveState("error");\n      if (surfaceErrors) setError(saveError instanceof Error ? saveError.message : "Failed to save draft.");\n      throw saveError;\n    }\n  };`,
    after: `  const persistSnapshot = async (snapshot: BlogPost, surfaceErrors = false) => {\n    const requestId = ++saveRequestRef.current;\n    setSaveState("saving");\n    try {\n      const saved = await saveBlogPost({ ...snapshot, docReadyContent: buildDocReadyContent(snapshot) }, password);\n      const isLatestRequest = requestId === saveRequestRef.current;\n      const currentMatchesSnapshot = fingerprint(currentDraftRef.current) === fingerprint(snapshot);\n      if (isLatestRequest) {\n        lastSavedFingerprintRef.current = fingerprint(saved);\n        onSaved(saved);\n      }\n      if (isLatestRequest && currentMatchesSnapshot) {\n        currentDraftRef.current = saved;\n        setDraft(saved);\n        setSaveState("saved");\n      } else if (isLatestRequest) {\n        setSaveState("unsaved");\n      }\n      return saved;\n    } catch (saveError) {\n      if (requestId === saveRequestRef.current) setSaveState("error");\n      if (surfaceErrors) setError(saveError instanceof Error ? saveError.message : "Failed to save draft.");\n      throw saveError;\n    }\n  };`,
  },
  {
    label: 'inline image upload',
    before: `  const uploadInlineImage = async (file: File) => {\n    const visual: BlogVisual = {\n      id: \`visual_\${Date.now()}_\${Math.random().toString(36).slice(2, 6)}\`,\n      visualType: "workflow",\n      fileName: file.name,\n      alt: { en: stripExtension(file.name), de: stripExtension(file.name), tr: stripExtension(file.name) },\n      caption: { en: "", de: "", tr: "" },\n      prompt: \`Uploaded editorial visual for \${draft.topic}\`,\n      placement: "Inline article body",\n      stylePreset: "editorial-lifestyle",\n      status: "placeholder",\n    };\n    const withVisual = { ...currentDraftRef.current, visuals: [...currentDraftRef.current.visuals, visual] };\n    const persisted = await saveBlogPost(withVisual, password);\n    const uploaded = await uploadBlogVisual(persisted.id, visual.id, file, password);\n    currentDraftRef.current = uploaded;\n    setDraft(uploaded);\n    lastSavedFingerprintRef.current = fingerprint(uploaded);\n    onSaved(uploaded);\n    const result = uploaded.visuals.find((item) => item.id === visual.id);\n    if (!result?.url) throw new Error("Image upload completed but no URL was returned.");\n    return { url: result.url, alt: result.alt[language] || stripExtension(file.name) };\n  };`,
    after: `  const uploadInlineImage = async (file: File) => {\n    const visual: BlogVisual = {\n      id: \`visual_\${Date.now()}_\${Math.random().toString(36).slice(2, 6)}\`,\n      visualType: "workflow",\n      fileName: file.name,\n      alt: { en: stripExtension(file.name), de: stripExtension(file.name), tr: stripExtension(file.name) },\n      caption: { en: "", de: "", tr: "" },\n      prompt: \`Uploaded editorial visual for \${currentDraftRef.current.topic}\`,\n      placement: "Inline article body",\n      stylePreset: "editorial-lifestyle",\n      status: "placeholder",\n    };\n    ++saveRequestRef.current;\n    const uploadBase = currentDraftRef.current;\n    const withVisual = { ...uploadBase, visuals: [...uploadBase.visuals, visual] };\n    currentDraftRef.current = withVisual;\n    setDraft(withVisual);\n    setSaveState("saving");\n    const persisted = await saveBlogPost(withVisual, password);\n    const uploaded = await uploadBlogVisual(persisted.id, visual.id, file, password);\n    const latest = currentDraftRef.current;\n    const contentChangedDuringUpload = fingerprint({ ...latest, visuals: withVisual.visuals }) !== fingerprint(withVisual);\n    const merged = contentChangedDuringUpload\n      ? { ...latest, visuals: uploaded.visuals }\n      : uploaded;\n    currentDraftRef.current = merged;\n    setDraft(merged);\n    onSaved(merged);\n    if (contentChangedDuringUpload) {\n      setSaveState("unsaved");\n    } else {\n      lastSavedFingerprintRef.current = fingerprint(merged);\n      setSaveState("saved");\n    }\n    const result = uploaded.visuals.find((item) => item.id === visual.id);\n    if (!result?.url) throw new Error("Image upload completed but no URL was returned.");\n    return { url: result.url, alt: result.alt[language] || stripExtension(file.name) };\n  };`,
  },
]);

patchFile('client/src/components/admin/RichTextEditor.tsx', [
  {
    label: 'editor prop synchronization',
    before: `  useEffect(() => {\n    if (!editor) return;\n    const nextContent = content || "<p></p>";\n    if (editor.getHTML() !== nextContent) editor.commands.setContent(nextContent, { emitUpdate: false });\n  }, [content, editor]);`,
    after: `  const previousLanguageRef = useRef(language);\n  useEffect(() => {\n    if (!editor) return;\n    if (previousLanguageRef.current === language) return;\n    previousLanguageRef.current = language;\n    const nextContent = content || "<p></p>";\n    editor.commands.setContent(nextContent, { emitUpdate: false });\n  }, [language, editor, content]);`,
  },
]);
