# Project Overview

This is a Next.js 15+ project that functions as a desktop-style portfolio application with an integrated fantasy wiki system. The project is inspired by the lore of "Exocorpse," an underground corporation devoted to cleansing humanity's sins.

The application features a desktop-style interface with draggable and resizable windows, a taskbar, and desktop icons. The main feature is a comprehensive fantasy wiki system that allows for the creation and management of stories, worlds, characters, and factions.

## Tech Stack

- **Framework:** Next.js 15.5+ with Turbopack
- **Runtime:** Bun
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4+
- **Language:** TypeScript (strict mode)

## Building and Running

### Prerequisites

- Bun installed on your system

### Development

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the development server:

   ```bash
   bun dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Supabase

For local development:

- Start local Supabase:

  ```bash
  bun sb:start
  ```

- Reset database with migrations:

  ```bash
  bun sb:reset
  ```

For remote/linked development:

- Link to remote project:

  ```bash
  bun sbr:link
  ```

- Reset remote database:

  ```bash
  bun sbr:reset
  ```

## Development Conventions

- The project uses TypeScript with strict mode enabled.
- Styling is done with Tailwind CSS.
- The codebase is organized into `src/app`, `src/components`, `src/contexts`, `src/lib`, and `src/types`.
- Server-side logic for the wiki is handled in `src/lib/actions/wiki.ts`.
- The database schema is defined in `supabase/migrations`.

## Architecture

### Application Structure

The app uses a desktop metaphor with multiple "applications" that run in draggable/resizable windows:

- **WindowContext** (`src/contexts/WindowContext.tsx`): Global state manager for all windows.
- **Desktop Component** (`src/components/Desktop.tsx`): Main container that renders all active windows and desktop icons.
- **Window Component** (`src/components/Window.tsx`): Reusable window wrapper using `react-rnd` for drag/resize functionality.

### Wiki System Architecture

The wiki is a comprehensive fantasy story management system with a hierarchical structure:

**Hierarchy**: Stories → Worlds → Characters & Factions

**Data Flow**:

- `src/components/apps/Wiki.tsx` - Server component that fetches initial stories.
- `src/components/apps/WikiClient.tsx` - Client component with all interactivity.
- **Server Actions** (`src/lib/actions/wiki.ts`): All database operations are server actions.

### Database Design Patterns

- **Hierarchical Data**: Stories contain worlds, worlds contain characters/factions/locations.
- **Polymorphic Relations**: Tags can be attached to any entity type via `entity_tags` table.
- **Audit Fields**: Most tables have `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.
- **Full-Text Search**: Implemented using PostgreSQL's `tsvector` with search functions.
- **Views**: Pre-built views for common queries (`character_details`, `event_details`, `story_hierarchy`).
