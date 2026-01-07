# Chronophoto Editor

## Overview

A browser-based chronophotography application that transforms videos into motion composite images. Users upload videos, extract frames at configurable intervals, select regions of interest across frames, and generate a final composite image showing motion over time. All video processing happens client-side using the HTML5 Canvas and Video APIs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and UI animations
- **Build Tool**: Vite with path aliases (`@/` for client/src, `@shared/` for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: REST endpoints defined in `shared/routes.ts` with Zod validation
- **Development**: Vite middleware for HMR in development, static file serving in production

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command
- **Connection**: Node-postgres pool via `DATABASE_URL` environment variable

### Key Design Decisions

1. **Client-side video processing**: Frame extraction, canvas manipulation, and image composition all run in the browser to avoid server load and enable offline capability.

2. **Shared schema and routes**: Types and API definitions live in `shared/` directory, enabling type-safe contracts between frontend and backend.

3. **Monorepo structure**: Single repository with `client/`, `server/`, and `shared/` directories. Build produces bundled output in `dist/`.

4. **Dark mode default**: The UI is designed dark-first with a purple accent color scheme.

5. **Internationalization**: Built-in i18n support with English and French translations via React context.

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for queries and schema management
- connect-pg-simple for session storage capability

### UI Libraries
- Radix UI primitives (full suite of accessible components)
- shadcn/ui components built on Radix
- Lucide React for icons
- class-variance-authority and tailwind-merge for style composition

### Development Tools
- Vite for frontend bundling with React plugin
- esbuild for server bundling
- TypeScript with strict mode
- Replit-specific plugins for development experience