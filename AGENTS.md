# Exocorpse contributor guide

Exocorpse is a Next.js 16 desktop-style portfolio, commission site, blog, and fantasy wiki. Bun is the package manager and runtime, React 19 powers the UI, and Tuturuuu CMS is the only runtime database and content store.

## Commands

- `bun dev`: run the Turbopack development server.
- `bun check`: run formatting, linting, and tests.
- `bun build`: build the production application.
- `bun cms:migrate`: run the operator-only, idempotent hard-cutover importer from a secured JSON export.

## Content architecture

- Public server actions in `src/lib/actions` read only Tuturuuu public delivery through `src/lib/tuturuuu-cms-delivery.ts`.
- Authenticated branded admin operations use `src/lib/tuturuuu-cms-repository.ts` and the current encrypted Tuturuuu session.
- Public media URLs are already versioned Tuturuuu asset endpoints. Never add local URL signing, URL lookup tables, or direct storage clients.
- Content relations are Tuturuuu CMS UUID relations. Legacy IDs may be retained only as import provenance.
- The retired image-search surface must not be reintroduced.

## UI conventions

- Preserve the desktop/window metaphor and anatomical terminal aesthetic.
- Prefer container query variants (`@sm:`, `@md:`, and larger) inside window content.
- Use Next Image with dimensions or `fill`, and verify that placeholders disappear after load.

## Shipping

- Lefthook owns pre-commit formatting and lint checks; preserve it.
- Run `bun check` and `bun build` before a production push.
- A cutover is incomplete until public Browser verification, authenticated Chrome verification, CDN headers, and production logs all pass.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
