# Premium HR Pass Platform

A minimalist, persona-aware digital pass system featuring QR-based wallet cards with 3D flip interactions. The system supports three personas (Candidate, Manager, Employee) with role-specific workflows, stage tracking, and a luxury "claymorphism" aesthetic.

## Features

### Core Features
- **Multi-Persona Support**: Candidate, Manager, and Employee views with role-specific workflows
- **3D Card Flip**: Interactive wallet card with smooth flip animation
- **QR Code Identity**: QR codes serve as primary identifier (no photos)
- **Stage Tracking**: Visual timeline of hiring/onboarding progress
- **Claymorphism Design**: Luxury soft UI aesthetic with depth and shadows

### Real-Time Features
- **WebSocket Integration**: Live updates for interview slot synchronization
- **Notification System**: In-app notifications with scheduled reminders
- **Settings Persistence**: Automation toggles saved to database

### Admin Features
- **Batch Onboarding**: Process multiple candidates at once
- **Broadcast Messages**: Send notifications to multiple passes
- **Milestone Reminders**: Automated reminders for upcoming events
- **Action Logging**: Track all admin operations

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Wouter
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-Time**: WebSocket (ws)
- **Styling**: Claymorphism/Soft UI design system

## Server Architecture

This project supports two server architectures:

### 1. Modular Structure (Default - Recommended for Development)
The server is split into focused modules in the `server/` directory:
- `index.ts` - Main entry point
- `routes.ts` - API route handlers
- `db.ts` - Database connection
- `storage.ts` - Data access layer
- `websocket.ts` - WebSocket server
- `scheduler.ts` - Background jobs
- `static.ts` - Static file serving
- `vite.ts` - Dev server integration

**Usage:**
```bash
npm run dev        # Development mode
npm run build      # Production build
npm start          # Run production build
```

### 2. Unified Single File (Optimized for Replit)
All server code merged into `server/main.ts` for simplified deployment.

**Usage:**
```bash
npm run dev:unified      # Development mode with unified file
npm run build:unified    # Build with unified file
```

See `server/UNIFIED_MAIN_README.md` for more details on the unified architecture.

## API Endpoints

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate with relations
- `GET /api/candidates/code/:code` - Get by pass code
- `POST /api/candidates` - Create candidate
- `PATCH /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Timeline
- `GET /api/candidates/:id/timeline` - Get timeline entries
- `POST /api/timeline` - Create timeline entry
- `PATCH /api/timeline/:id` - Update entry
- `DELETE /api/timeline/:id` - Delete entry

### Evaluations
- `GET /api/candidates/:id/evaluations` - Get evaluations
- `POST /api/evaluations` - Create evaluation
- `PATCH /api/evaluations/:id` - Update evaluation
- `DELETE /api/evaluations/:id` - Delete evaluation

### Documents
- `GET /api/candidates/:id/documents` - Get documents
- `POST /api/documents` - Create document
- `DELETE /api/documents/:id` - Delete document

### Interview Slots
- `GET /api/slots/link/:linkId` - Get slots by booking link
- `GET /api/slots/manager/:managerCode` - Get manager's slots
- `GET /api/slots/candidate/:candidateCode` - Get candidate's slots
- `POST /api/slots` - Create slot
- `PATCH /api/slots/:id` - Update slot (book/cancel)
- `DELETE /api/slots/:id` - Delete slot

### Settings
- `GET /api/settings/:passCode` - Get pass settings
- `PUT /api/settings/:passCode` - Replace settings
- `PATCH /api/settings/:passCode` - Update settings

### Notifications
- `GET /api/notifications/:passCode` - Get all notifications
- `GET /api/notifications/:passCode/unread` - Get unread only
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read

### Admin Actions
- `GET /api/admin/actions` - Get action history
- `POST /api/admin/batch-onboard` - Batch onboard candidates
- `POST /api/admin/broadcast` - Send broadcast message
- `POST /api/admin/schedule-reminder` - Schedule a reminder
- `POST /api/admin/milestone-reminders/:candidateId` - Auto-schedule reminders

## WebSocket Events

Connect to `/ws` for real-time updates.

### Client Messages
```json
{ "type": "subscribe", "passCode": "ABC123" }
{ "type": "subscribe_slots", "linkId": "booking-link-id" }
{ "type": "unsubscribe_slots", "linkId": "booking-link-id" }
```

### Server Messages
```json
{ "type": "slot_update", "linkId": "...", "data": {...} }
{ "type": "settings_update", "passCode": "...", "data": {...} }
{ "type": "notification", "passCode": "...", "data": {...} }
{ "type": "admin_action", "data": {...} }
```

## Database Schema

### Tables
- `candidates` - Core candidate/employee records
- `timeline_entries` - Stage tracking entries
- `evaluations` - Interviewer evaluations
- `documents` - Uploaded documents
- `interview_slots` - Booking slots
- `pass_settings` - Per-pass settings
- `notifications` - In-app notifications
- `admin_actions` - Admin action log

## Testing the Platform

### 1. Create a Demo Candidate
```bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "code": "JANE2024",
    "role": "Senior Engineer",
    "department": "Engineering",
    "status": "Phone Screen",
    "stage": 2,
    "startDate": "2024-01-15"
  }'
```

### 2. Add Timeline Entry
```bash
curl -X POST http://localhost:5000/api/timeline \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": 1,
    "title": "Technical Interview",
    "status": "upcoming",
    "date": "2024-12-05 10:00",
    "description": "Technical assessment with engineering team"
  }'
```

### 3. Create Interview Slots
```bash
curl -X POST http://localhost:5000/api/slots \
  -H "Content-Type: application/json" \
  -d '{
    "linkId": "booking-abc123",
    "managerCode": "MGR001",
    "candidateCode": "JANE2024",
    "date": "2024-12-05",
    "time": "10:00",
    "duration": 60,
    "status": "available"
  }'
```

### 4. Book a Slot
```bash
curl -X PATCH http://localhost:5000/api/slots/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "booked"
  }'
```

### 5. Send a Notification
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "passCode": "JANE2024",
    "type": "reminder",
    "title": "Interview Tomorrow",
    "message": "Your technical interview is scheduled for tomorrow at 10 AM.",
    "priority": "high"
  }'
```

### 6. Batch Onboard
```bash
curl -X POST http://localhost:5000/api/admin/batch-onboard \
  -H "Content-Type: application/json" \
  -d '{
    "candidateCodes": ["JANE2024", "JOHN2024"],
    "performedBy": "admin"
  }'
```

## Environment Variables

The following environment variables are configured automatically:
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - DB credentials

## Development

### Run the Application
```bash
npm run dev
```

### Push Database Schema
```bash
npm run db:push
```

### View Database
```bash
npm run db:studio
```

## Architecture Notes

1. **Frontend-First Design**: Maximum logic in React components
2. **Thin Backend**: Express routes delegate to storage layer
3. **Real-Time Sync**: WebSocket for slot/notification updates
4. **Scheduler Service**: Background job for milestone reminders
5. **Type Safety**: Shared schema between frontend and backend
6. **Soft UI**: Claymorphism design with CSS custom properties

## Security Considerations

> **Note**: This is a prototype. In production, implement:
> - Authentication middleware
> - Role-based access control
> - Rate limiting
> - Input sanitization
> - HTTPS enforcement

## License

MIT
