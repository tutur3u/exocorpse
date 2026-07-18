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
