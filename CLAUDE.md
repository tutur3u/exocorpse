# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Exocorpse" - a Next.js 15+ desktop-style portfolio application with an integrated fantasy wiki system. The app features a window-based UI that mimics a desktop environment, with draggable/resizable windows for different applications (About Me, Portfolio, Commission, Wiki).

### Exocorpse Lore & Theme

**Exocorpse** is an underground corporation that strives to cleanse all of humanity's sins by devoting themselves to being sinners. The staff of Exocorpse perform missions like heists, hitman assassinations, bodyguards, and information manipulation, all in aim of a better world. The corporation has extreme interests in the biology and psychology of humanity, which divides them into two prototypes:

- **Prototype: Pulse** - The branch designated for people who excel in physical strength, combat, agility and brute force. Pulses are the frontliners of the corporation. The rhythm of each step, the aim of their strategies, they follow and mimic the rhythm of the heart.

- **Prototype: Neuro** - The branch designated for people who excel in intelligence and psychology. Neuros tend to do background work, unlike Pulses who work in the frontlines. The dialects of the world, the carvings of each letter, they play and tie it all within their hands.

**Design Philosophy**: The website reflects themes related to human anatomy (skeletal system, organs) while maintaining a terminal-like aesthetic. The design should subtly incorporate biological/anatomical elements without being overwhelming, representing the duality of the Pulse and Neuro prototypes.

## Tech Stack

- **Framework**: Next.js 15.5+ with Turbopack, React 19+
- **Runtime**: Bun (package manager and runtime)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4+
- **Language**: TypeScript (strict mode enabled)

## Common Commands

### Development

```bash
bun dev              # Start dev server with Turbopack
bun build            # Build for production with Turbopack
bun start            # Start production server
bun lint             # Run ESLint
bun format:check     # Check code formatting with Prettier
bun format:fix       # Auto-fix formatting with Prettier
```

### Supabase - Local Development

```bash
bun sb:status        # Check local Supabase status
bun sb:start         # Start local Supabase
bun sb:stop          # Stop local Supabase
bun sb:reset         # Reset local database (WARNING: destroys data)
bun sb:diff          # Create migration from schema changes
bun sb:new           # Create new empty migration
bun sb:up            # Apply pending migrations locally
bun sb:typegen       # Generate TypeScript types from schema
bun sb:pull          # Pull schema from local Supabase
bun sb:push          # Push migrations to local Supabase
bun sb:sync          # Push then pull (sync local changes)
```

### Supabase - Remote/Linked Development

```bash
bun sbr:link         # Link to remote Supabase project
bun sbr:reset        # Reset linked database (WARNING: destroys data)
bun sbr:diff         # Create migration from remote schema changes
bun sbr:typegen      # Generate types from linked project
bun sbr:up           # Apply migrations to linked project
bun sbr:pull         # Pull schema from linked project
bun sbr:push         # Push migrations to linked project
bun sbr:sync         # Push then pull (sync with remote)
```

**Important**: After any schema changes, always run the appropriate typegen command to update `supabase/types.ts`.

## Architecture

### Application Structure

The app uses a desktop metaphor with multiple "applications" that run in draggable/resizable windows:

- **WindowContext** (`src/contexts/WindowContext.tsx`): Global state manager for all windows
  - Manages window lifecycle (open, close, minimize, maximize, restore)
  - Handles window stacking (z-index) and focus
  - Window position and size management
  - Each app has a config with `id`, `title`, `icon`, `component`, default size/position

- **Desktop Component** (`src/components/Desktop.tsx`): Main container that renders all active windows and desktop icons

- **Window Component** (`src/components/Window.tsx`): Reusable window wrapper using react-rnd for drag/resize functionality

### Available Applications

1. **About Me** - Personal information page
   - Basic information about the creator
   - Likes & dislikes section
   - FAQ section
   - Social media links

2. **Portfolio** - Project showcase with dual focus
   - **Art Tab**: Gallery of artwork pieces
   - **Writing Tab**: Collection of written works
   - **Rotating Gallery**: Showcases featured works from the current month
   - **Lightbox System**: Click artwork to open detailed view with title + description
   - **Reading Modal**: Click writing to open full draft in a modal
   - **Filtering System**:
     - Filter by year
     - Tag filters (original work, fanwork, commissioned work, etc.)

3. **Commission** - Services and pricing information
   - Pricing lists and services offered
   - Rotating gallery for each service showing examples
   - Blacklist viewer (lightbox modal)
   - Terms of Service viewer (lightbox modal)

4. **Wiki** - Fantasy story wiki system (**PRIMARY FEATURE - FULLY IMPLEMENTED**)
   - Comprehensive character and world encyclopedia
   - Story browsing with descriptions
   - **Dynamic Theming**: Visual elements (background, colors) change per story/world
   - **Character Pages**: Detailed profiles including:
     - Basic info (name, age, description)
     - Multiple outfits/costumes
     - Lore & backstory
     - Moodboards
     - Character gallery (functions like portfolio lightbox)
   - Think ToyHouse or fandom wiki pages

5. **Blog** - Personal blog (FUTURE FEATURE - NOT PRIORITY)
   - Standard blog functionality
   - Personal leisure content

### Wiki System Architecture

The wiki is a comprehensive fantasy story management system with a hierarchical structure:

**Hierarchy**: Stories → Worlds → Characters & Factions

**Data Flow**:

- `src/components/apps/Wiki.tsx` - Server component that fetches initial stories
- `src/components/apps/WikiClient.tsx` - Client component with all interactivity
  - Manages view modes: `stories` → `worlds` → `content` (characters & factions)
  - Breadcrumb navigation between hierarchy levels
  - CRUD operations for all entities
  - Form modals for creating/editing entities

**Server Actions** (`src/lib/actions/wiki.ts`):

- All database operations are server actions (marked with `"use server"`)
- CRUD functions for: stories, worlds, characters, factions
- Relationship management: character-faction memberships
- Soft deletes (sets `deleted_at` timestamp)

**Database Schema** (`supabase/migrations/20251013143738_initial_setup.sql`):

- Comprehensive schema with 20+ tables
- Core entities: stories, worlds, characters, factions, locations, events
- Junction tables for many-to-many relationships
- Customizable type tables: relationship_types, event_types, outfit_types
- Full-text search support with PostgreSQL tsvector
- Automatic `updated_at` triggers on all tables
- Soft delete pattern (`deleted_at` column)
- **RLS is DISABLED** - all tables are publicly accessible

### Key Features

**Window Management**:

- Windows can be dragged, resized, minimized, maximized, and restored
- Z-index stacking for focus management
- Windows persist state while minimized
- Clicking a minimized window restores it to previous state

**Theme System**:

- Stories can have custom themes (colors, backgrounds)
- `StoryThemeContext` (`src/contexts/StoryThemeContext.tsx`) applies themes when viewing stories
- Tailwind with dark mode support

**ListDetail Component** (`src/components/ListDetail.tsx`):

- Reusable master-detail pattern used throughout wiki
- Supports grid and list layouts
- Custom renderers for item cards and detail views

### Styling Conventions

- Using Tailwind CSS v4+ with @tailwindcss/postcss
- **Container Queries**: Use `@sm:`, `@md:`, `@lg:`, `@xl:`, `@2xl:` instead of `sm:`, `md:`, `lg:`, `xl:`, `2xl:` for responsive design. This allows components to scale based on their container's width rather than viewport width. Add `@container` class to parent elements.
- Gradient backgrounds and modern glassmorphism effects
- Dark mode support throughout
- Consistent color schemes: blue/purple for stories, indigo/cyan for worlds, green/purple for characters/factions

## Important Notes

1. **Path Aliases**: `@/*` maps to `src/*` (configured in tsconfig.json)

2. **Supabase Client**:
   - Use `getSupabaseServer()` for server components/actions
   - Location: `src/lib/supabase/server.ts` and `src/lib/supabase/client.ts`

3. **Type Generation**: Always regenerate types after schema changes using `bun sb:typegen` or `bun sbr:typegen`

4. **Migrations**:
   - Create migrations with `bun sb:diff` after making schema changes
   - Migration files go in `supabase/migrations/`
   - Use `extensions.uuid_generate_v4()` for UUID generation (NOT `gen_random_uuid()`)

5. **Soft Deletes**: All main entities use soft delete pattern. Check `deleted_at IS NULL` in queries.

6. **Window Types**: See `src/types/window.ts` for window-related type definitions

7. **Forms**: Character, Faction, Story, and World forms are in `src/components/apps/forms/`

8. **Image Handling**: Uses Next.js Image component with proper width/height attributes

## Database Design Patterns

- **Hierarchical Data**: Stories contain worlds, worlds contain characters/factions/locations
- **Polymorphic Relations**: Tags can be attached to any entity type via `entity_tags` table
- **Audit Fields**: Most tables have `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`
- **Full-Text Search**: Implemented using PostgreSQL's `tsvector` with search functions
- **Views**: Pre-built views for common queries (`character_details`, `event_details`, `story_hierarchy`)
