# Blog Admin CMS Upgrade

Implemented on `fix/blog-admin-cms-localization-media`.

## Included
- Write in one source language and auto-localize missing EN/DE/TR content on Save/Publish.
- Manual `Localize other languages` action to refresh localized body, SEO metadata, FAQ, slugs, visual alt text, and captions.
- Dedicated Blog Listing Thumbnail manager with preview, upload/replace, and Hero fallback/selection.
- Correct Hero preview selection by `visualType=hero` rather than visual array position.
- Inline image upload directly from the editor using the authenticated existing blog media API.
- Existing uploaded visual insertion from the editor.
- Functional CTA, FAQ, KPI, Framework, Caption, and Internal Link editor actions.
- Blog-list table thumbnail visibility and publish-readiness checks.

## Verification
- Vercel preview build for commit `90da4da5d9726d823bf66ca529f902c81809cd10` completed successfully.
- No build errors; only the pre-existing chunk-size warning was reported.

## Production note
The live sasmaz.digital API currently resolves through the Railway-hosted Express server. The CMS continues to use the existing authenticated `/api/admin/blog-posts/*` endpoints there, so no incompatible API route migration is required for this UI upgrade.
