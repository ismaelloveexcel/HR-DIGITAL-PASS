# Deploying to Replit

This guide explains how to deploy the HR Digital Pass platform to Replit using the unified server file.

## Why Use the Unified File?

The unified `server/main.ts` file combines all server modules into a single file, which:
- Simplifies deployment to Replit
- Reduces file system overhead
- Makes code review easier
- Provides a single entry point

## Deployment Steps

### 1. Push to GitHub
The code is already set up in the repository. Make sure all changes are pushed:
```bash
git push origin main
```

### 2. Import to Replit
1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Choose this repository: `ismaelloveexcel/HR-DIGITAL-PASS`

### 3. Configure Environment
Replit should automatically detect the `.replit` configuration. The key settings are:
- **Run command**: `npm run dev` (uses modular structure by default)
- **Build command**: `npm run build`
- **Start command**: `npm run start`

### 4. Set Environment Variables
Add these environment variables in Replit's Secrets:
- `DATABASE_URL` - Your PostgreSQL connection string (Replit can provision this)
- `NODE_ENV` - Set to `production` for production builds

### 5. Provision Database
In Replit:
1. Click on "Secrets" in the left sidebar
2. Add a new PostgreSQL database from the services
3. This will automatically set `DATABASE_URL`

### 6. Initialize Database
Run the database migration:
```bash
npm run db:push
```

### 7. Build and Run
Either use the default modular structure:
```bash
npm run build
npm start
```

Or use the unified file:
```bash
npm run build:unified
npm start
```

## Using the Unified File in Replit

To use the unified `server/main.ts` file instead of the modular structure:

### Option 1: Update .replit file
Edit `.replit` to use the unified file:
```toml
[workflows.workflow.tasks]
task = "shell.exec"
args = "npm run dev:unified"
waitForPort = 5000
```

### Option 2: Update package.json
Change the "dev" script in `package.json` to:
```json
"dev": "NODE_ENV=development tsx server/main.ts"
```

### Option 3: Set Environment Variable
Set this in Replit Secrets:
```
USE_UNIFIED_MAIN=true
```
Then run:
```bash
npm run build
npm start
```

## Verifying the Deployment

1. Click the "Run" button in Replit
2. Wait for the server to start (you should see "serving on port 5000")
3. Open the web preview
4. You should see the HR Digital Pass platform

## Troubleshooting

### Database Connection Errors
- Make sure `DATABASE_URL` is set in Replit Secrets
- Run `npm run db:push` to initialize the database schema

### Port Already in Use
- Replit uses port 5000 by default, which is configured in the code
- If you need to change it, update the `PORT` environment variable

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node.js 20 or later

### Module Not Found Errors
- Make sure all dependencies are in `package.json`
- Run `npm install` again

## Additional Resources

- See `server/UNIFIED_MAIN_README.md` for details on the unified file structure
- See main `README.md` for API documentation
- Check `.replit` configuration for Replit-specific settings

## Support

If you encounter issues:
1. Check the Replit console logs
2. Verify all environment variables are set
3. Ensure the database is provisioned and accessible
4. Try rebuilding: `npm run build:unified`
