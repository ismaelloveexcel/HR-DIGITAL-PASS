# Premium HR Pass Platform

## Overview

The Premium HR Pass Platform is a minimalist, persona-aware digital pass system designed for HR workflows at Baynunah. The platform provides QR-based wallet cards with 3D flip interactions, supporting three distinct personas: Candidates, Managers, and Employees. Each persona has role-specific workflows with real-time synchronization, automated notifications, and comprehensive tracking capabilities.

The system emphasizes a clean, luxury "claymorphism" design aesthetic with glassmorphism effects, soft shadows, and a light color palette. The platform is built as a PWA-ready application that can be added to home screens for a native wallet-like experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**: React with TypeScript using Wouter for client-side routing. The application uses a component-based architecture with Vite as the build tool and development server.

**State Management**: TanStack Query (React Query) handles server state with aggressive caching strategies (staleTime: Infinity, no automatic refetching). Local state uses React hooks with a custom `usePassData` hook that provides reactive access to a centralized pass data store with localStorage persistence.

**UI Component Library**: Radix UI primitives with custom styled wrappers, following the shadcn/ui pattern. Components use class-variance-authority (CVA) for variant management and Tailwind CSS for styling.

**Design System**: Implements a "claymorphism" aesthetic with:
- Ultra-minimalist white/light backgrounds (#FFFFFF to #F9FAFB)
- Flat solid colors (no gradients)
- Glassmorphism effects (backdrop-blur, semi-transparent backgrounds)
- Soft shadows (0 4px 6px rgba(0,0,0,0.02))
- Inter font family (weights 300-700)
- Primary color: #1E40AF (dark blue)
- Success color: #059669 (muted green)

**Animation**: Framer Motion for page transitions, card flips, and interactive elements. Uses fade-in loading animations and scale hover effects.

**Real-Time Communication**: WebSocket integration (`useWebSocket` hook) for live updates including interview slot synchronization, settings changes, notifications, and admin actions. Falls back to polling if WebSocket connection fails.

**PWA Support**: Includes manifest.json for "Add to Home Screen" functionality, treating passes as wallet cards.

### Backend Architecture

**Framework**: Express.js with TypeScript, serving both API endpoints and static assets.

**API Design**: RESTful API with the following resource structure:
- `/api/candidates` - CRUD operations for candidates
- `/api/candidates/:id/timeline` - Timeline entry management
- `/api/candidates/:id/evaluations` - Evaluation/assessment tracking
- `/api/candidates/:id/documents` - Document management
- `/api/interview-slots` - Interview scheduling with real-time sync
- `/api/settings` - Pass settings and automation toggles
- `/api/notifications` - Notification management
- `/api/admin-actions` - Admin operations logging

**WebSocket Server**: Separate WebSocket server mounted on `/ws` path for real-time bidirectional communication. Supports subscription model where clients subscribe to specific pass codes or link IDs.

**Background Processing**: Scheduler service runs every 60 seconds to process scheduled notifications, interview reminders, and milestone alerts. Uses database-driven scheduling rather than cron jobs.

**Middleware Stack**:
- JSON body parsing with raw body preservation for webhook verification
- URL-encoded form data parsing
- Request logging with timestamps and duration tracking
- Static file serving for production builds

### Data Storage

**Database**: PostgreSQL with connection pooling via @neondatabase/serverless, allowing deployment to serverless platforms.

**ORM**: Drizzle ORM with type-safe schema definitions and migrations. Schema is shared between client and server via the `/shared` directory.

**Schema Design**:
- `candidates` - Core candidate information with unique code-based access
- `timelineEntries` - Recruitment stage tracking with ordering
- `evaluations` - Assessment scores and notes
- `documents` - File references with metadata
- `interviewSlots` - Scheduling with status tracking (open/held/booked)
- `passSettings` - Per-pass automation toggles and module visibility
- `notifications` - Scheduled and immediate notification queue
- `adminActions` - Audit log for admin operations

**Relations**: One-to-many relationships between candidates and their timeline/evaluations/documents, all with cascade deletion.

**Data Persistence Strategy**: Dual-layer approach:
1. PostgreSQL for shared/server-managed data
2. localStorage for client-side pass data store (SOLO HR workflows)

### Authentication & Authorization

**Access Control**: Code-based access system using unique pass codes (PASS-XXX for candidates, REQ-XXX for managers, ONB-XXX for onboarding). No traditional user authentication - passes are accessed directly via URL.

**Security Considerations**: Pass codes serve as bearer tokens. The system assumes codes are distributed securely and treats possession of a valid code as authorization.

### External Dependencies

**Third-Party Services**:
- Neon Database (PostgreSQL hosting with serverless support)
- WebSocket protocol for real-time features (native implementation)

**Key npm Packages**:
- `@neondatabase/serverless` - Database connectivity
- `drizzle-orm` - Type-safe database queries
- `ws` - WebSocket server implementation
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `framer-motion` - Animation library
- `qrcode.react` - QR code generation
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Utility-first CSS
- `date-fns` - Date manipulation

**Development Tools**:
- Vite - Build tool and dev server
- TypeScript - Type safety
- ESBuild - Production bundling
- Drizzle Kit - Database migrations

**Replit-Specific Integrations**:
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- `@replit/vite-plugin-cartographer` - Development navigation
- `@replit/vite-plugin-dev-banner` - Dev environment indicator

**Asset Management**: Static assets served from `/client/public`, with custom Vite plugin for updating OpenGraph meta tags with deployment URLs.

### Deployment Architecture

**Build Process**: Two-stage build:
1. Client build via Vite → `dist/public`
2. Server build via ESBuild → `dist/index.cjs` (bundled for faster cold starts)

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Environment mode (development/production)

**Production Serving**: Express serves pre-built static files from `dist/public` with fallback to `index.html` for client-side routing.

**Development Mode**: Vite dev server runs in middleware mode alongside Express, enabling HMR and source maps.