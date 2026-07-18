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
