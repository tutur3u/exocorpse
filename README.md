# EXOCORPSE

A desktop-inspired portfolio, commission site, blog, Heaven Space experience, and fantasy wiki built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Tuturuuu CMS.

## Development

```bash
bun install
bun dev
bun check
bun build
```

Public content is read from Tuturuuu delivery. The branded `/admin` surface uses the current Tuturuuu session for entry bundles, relations, publication state, blacklist moderation, and managed media.

Admin media uploads request signed Tuturuuu upload metadata and send bytes directly from the browser. Upload lifecycle state lives at the editor-dialog level so switching accordion sections or quick-navigation tabs never cancels an upload or hides its progress. Artwork editors are media-first; supporting copy and publishing controls are optional refinements.

The `/admin` dashboard preserves the legacy welcome banner, Wiki Management and Content Management cards, navigation, and storage accordion styling. The retired "Tuturuuu CMS migration" panel is omitted. Content and storage continue to use the current Tuturuuu CMS and Drive integrations; the legacy database is not restored.

Character editors expose a dedicated Gallery tab, separate from profile/banner media and Outfits. Visuals links to that tab. Gallery supports direct image upload and the full artwork editor (title, description, artist attribution, commission date, tags, featured state, content warnings, and reference sheets). Gallery, outfit, and location-gallery cards provide edit/delete actions; deleting requires confirmation. Returning from a child editor restores the appropriate parent tab and unsaved parent fields. Outfit notes and reference URLs, and location-gallery commission dates, tags, and featured state remain editable even when older CMS metadata omits their field definitions. Explicit operator disabling remains authoritative. New characters must be saved before adding related artwork or outfits. Regression coverage lives in `legacy-editor-tabs.test.ts` and `character-gallery-parity.test.tsx`.

The Build Check workflow runs formatting, lint, TypeScript, and regression tests before the Vercel build for the pushed commit. Use that CI build on hosts where local production builds are prohibited.

## Hard-cutover importer

The operator-only importer accepts a secured canonical JSON export and performs idempotent collection, typed-field, relation-definition, entry, relation, and asset upserts before managed-storage ingestion and parity checks. The export addresses entries with `collectionSlug`, relations with `definitionKey`, and all records with stable source IDs; environment-specific CMS UUIDs are resolved during the run.

```bash
TUTURUUU_API_BASE_URL=https://tuturuuu.com/api/v1 \
TUTURUUU_EXOCORPSE_WORKSPACE_ID=... \
TUTURUUU_CUTOVER_BEARER_TOKEN=... \
EXOCORPSE_CUTOVER_EXPORT=./private/exocorpse-cutover.json \
bun cms:migrate
```

The retained collection schema and typed fields live in `scripts/exocorpse-cms-schema.ts`. The export and bearer token must never be committed. Any unresolved relation, count mismatch, or failed managed asset aborts the cutover.
