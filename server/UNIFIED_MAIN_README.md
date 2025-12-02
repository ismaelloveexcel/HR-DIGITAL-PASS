# Unified Server Main File

This directory now contains a unified `main.ts` file that merges all server modules into a single file for easier deployment to Replit or other platforms.

## Files

### Original Modular Structure
- `index.ts` - Main entry point
- `routes.ts` - API route handlers
- `db.ts` - Database connection setup
- `storage.ts` - Data access layer
- `websocket.ts` - WebSocket server and handlers
- `scheduler.ts` - Background job scheduler for notifications
- `static.ts` - Static file serving for production
- `vite.ts` - Vite development server integration

### New Unified File
- `main.ts` - All-in-one server file containing all the above functionality

## Usage

### For Replit Deployment (Using Unified File)

The unified `main.ts` can be used as a single-file entry point:

```bash
# Build with unified main.ts
USE_UNIFIED_MAIN=true npm run build

# Or run directly in development
tsx server/main.ts
```

### For Standard Development (Using Modular Structure)

The original modular structure is still available and is the default:

```bash
# Build with modular structure (default)
npm run build

# Or run in development
npm run dev
```

## Benefits of Unified File

1. **Single File Deployment**: Easier to deploy to platforms like Replit where you might want a single entry point
2. **Easier Code Review**: All server code in one place for comprehensive review
3. **Simplified Dependencies**: Clear view of all imports and dependencies in one file
4. **Better for Bundling**: Single entry point can be more efficient for bundlers

## Structure of main.ts

The unified file is organized in the following sections:

1. **Imports** - All required dependencies
2. **Database Setup** - Database connection and configuration
3. **Storage Layer** - Data access methods (IStorage interface and DatabaseStorage class)
4. **WebSocket Setup** - WebSocket server and message handlers
5. **Scheduler** - Background job scheduler for notifications and reminders
6. **Static File Serving** - Production static file handler
7. **Vite Dev Server** - Development server setup
8. **Routes** - All API endpoint handlers
9. **Express App Setup** - Main Express application configuration

## Maintaining Both Versions

When making changes to the server:

1. **If using modular structure**: Make changes to individual files in `server/` directory
2. **If using unified file**: Make changes to `server/main.ts`
3. **To sync changes**: Either manually update both or decide on one as the source of truth

## Recommendation

For most development work, use the **modular structure** (original files) as it's easier to navigate and maintain. Use the **unified file** when you need to deploy to Replit or want a single-file bundle.

The build script now supports both approaches via the `USE_UNIFIED_MAIN` environment variable.
