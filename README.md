# Exocorpse

A Next.js 15+ desktop-style portfolio application with an integrated fantasy wiki system, inspired by the lore of Exocorpse - an underground corporation devoted to cleansing humanity's sins.

## About Exocorpse

**Exocorpse** is an underground corporation that strives to cleanse all of humanity's sins by devoting themselves to being sinners. The staff perform missions like heists, assassinations, bodyguard duties, and information manipulation, all in pursuit of a better world.

The corporation divides its members into two prototype branches:

- **Prototype: Pulse** - Specialists in physical strength, combat, and agility. They are the frontliners who follow the rhythm of the heart.
- **Prototype: Neuro** - Masters of intelligence and psychology. They work in the background, manipulating the dialects and information of the world.

## Features

### Desktop-Style Interface

- Draggable, resizable windows mimicking a desktop OS
- Window management (minimize, maximize, restore, close)
- Z-index stacking and focus management

### Wiki System (Primary Feature)

- Comprehensive fantasy story encyclopedia
- Hierarchical structure: Stories → Worlds → Characters & Factions
- Dynamic theming that changes per story/world
- Detailed character profiles with outfits, backstory, moodboards, and galleries
- Faction management and character relationships
- Full CRUD operations with Supabase backend

### Portfolio (Planned)

- Dual tabs for artwork and writing
- Rotating gallery for featured monthly works
- Lightbox viewing with descriptions
- Advanced filtering by year and tags

### Commission Info (Planned)

- Service pricing and examples
- Rotating galleries per service
- Terms of Service and blacklist viewers

### About Me (Planned)

- Personal information and background
- Likes & dislikes
- FAQ section
- Social media links

## Tech Stack

- **Framework**: Next.js 15.5+ with Turbopack
- **Runtime**: Bun
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4+
- **Language**: TypeScript (strict mode)

## Getting Started

### Prerequisites

- Bun installed on your system

### Development

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Supabase Setup

For local development:

```bash
bun sb:start         # Start local Supabase
bun sb:reset         # Reset database with migrations
```

For remote/linked development:

```bash
bun sbr:link         # Link to remote project
bun sbr:reset        # Reset remote database
```

See `CLAUDE.md` for complete command reference.

## Project Structure

```bash
src/
├── app/                    # Next.js app directory
├── components/
│   ├── apps/              # Application windows
│   │   ├── Wiki.tsx       # Wiki app (server component)
│   │   ├── WikiClient.tsx # Wiki interactivity
│   │   ├── forms/         # CRUD forms
│   │   └── ...
│   ├── Desktop.tsx        # Desktop container
│   ├── Window.tsx         # Window wrapper
│   └── ...
├── contexts/              # React contexts
│   ├── WindowContext.tsx  # Window state management
│   └── StoryThemeContext.tsx
├── lib/
│   ├── actions/           # Server actions
│   │   └── wiki.ts        # Wiki CRUD operations
│   └── supabase/          # Supabase clients
└── types/                 # TypeScript types
```

## Documentation

For detailed technical documentation and architecture, see [CLAUDE.md](./CLAUDE.md).

## License

Private project.
