# Staff Management System

A robust, full-stack staff management system built with Next.js, Express.js, and PostgreSQL. Designed to handle large-scale staff operations across multiple store locations.

## Features

- **Authentication & Authorization** — JWT-based auth with 4 role levels (Super Admin, Admin, Manager, Viewer)
- **Staff Management** — Full CRUD with search, filter, pagination, bulk operations
- **Store/Branch Management** — Manage multiple locations with staff assignments
- **Attendance Tracking** — Clock in/out, manual entry, attendance reports
- **Performance Reviews** — Multi-category scoring with trends
- **Reporting & Analytics** — Dashboard with charts, exportable reports
- **Audit Logging** — Track every change with full history
- **Bulk Import/Export** — CSV import with validation, CSV export
- **Email Notifications** — Configurable SMTP, send credentials and reports
- **Password Management** — Auto-generated secure passwords, reset functionality

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, TailwindCSS, Recharts |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt |
| Email | Nodemailer |
| Deployment | Docker, Docker Compose |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### Option 1: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Start PostgreSQL (or use Docker)
docker compose up -d postgres

# 4. Generate Prisma client and run migrations
cd packages/backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Start both frontend and backend
cd ../..
npm run dev
```

### Option 2: Docker (All-in-One)

```bash
# Copy and configure environment
cp .env.example .env

# Build and start all services
docker compose up -d

# Seed the database
docker compose exec backend npx prisma db seed
```

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Super Admin |

## Project Structure

```
staff-management-system/
├── packages/
│   ├── backend/                 # Express.js API
│   │   ├── src/
│   │   │   ├── modules/         # Feature modules
│   │   │   │   ├── auth/        # Login, tokens
│   │   │   │   ├── staff/       # Staff CRUD, import/export
│   │   │   │   ├── store/       # Store management
│   │   │   │   ├── attendance/  # Clock in/out, records
│   │   │   │   ├── performance/ # Reviews, scoring
│   │   │   │   ├── user/        # User management
│   │   │   │   ├── report/      # Analytics, dashboards
│   │   │   │   └── email/       # SMTP, email sending
│   │   │   ├── middleware/      # Auth, RBAC, audit, errors
│   │   │   ├── utils/           # Crypto, CSV, pagination
│   │   │   └── config/          # DB, email, JWT config
│   │   └── prisma/
│   │       ├── schema.prisma    # Database schema
│   │       └── seed.ts          # Seed data
│   └── frontend/                # Next.js web app
│       └── src/
│           ├── app/             # Pages (App Router)
│           ├── components/      # UI components
│           ├── lib/             # API client, utils
│           └── hooks/           # React hooks
├── scripts/
│   └── migrate-existing-data.ts # Migrate from old JSON system
├── docker-compose.yml
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login with username/password
- `POST /api/auth/refresh` — Refresh access token

### Staff
- `GET /api/staff` — List staff (paginated, searchable, filterable)
- `POST /api/staff` — Create staff member
- `GET /api/staff/:id` — Get staff details
- `PUT /api/staff/:id` — Update staff
- `DELETE /api/staff/:id` — Delete staff
- `POST /api/staff/import` — Bulk import from CSV
- `GET /api/staff/export` — Export to CSV
- `POST /api/staff/bulk-delete` — Delete multiple staff
- `POST /api/staff/bulk-transfer` — Transfer staff between stores

### Stores
- `GET /api/stores` — List all stores
- `POST /api/stores` — Create store
- `GET /api/stores/:id` — Store details
- `PUT /api/stores/:id` — Update store
- `DELETE /api/stores/:id` — Delete store
- `GET /api/stores/:id/staff` — Store staff list
- `GET /api/stores/:id/analytics` — Store analytics

### Attendance
- `GET /api/attendance` — List attendance records
- `POST /api/attendance/clock-in` — Clock in
- `POST /api/attendance/clock-out` — Clock out
- `POST /api/attendance` — Manual entry
- `GET /api/attendance/summary` — Attendance summary

### Performance
- `POST /api/performance` — Create review
- `GET /api/performance/:staffId` — Staff reviews
- `GET /api/performance/summary` — Performance summary

### Reports
- `GET /api/reports/dashboard` — Dashboard analytics
- `GET /api/reports/staff` — Staff report
- `GET /api/reports/attendance` — Attendance report
- `GET /api/reports/performance` — Performance report

### Users
- `GET /api/users` — List users
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### Email
- `POST /api/email/send` — Send email
- `POST /api/email/credentials` — Send staff credentials
- `GET/POST/PUT/DELETE /api/email/smtp-configs` — SMTP management

## Role Permissions

| Feature | Super Admin | Admin | Manager | Viewer |
|---------|-------------|-------|---------|--------|
| View Staff | ✓ | ✓ | ✓ | ✓ |
| Add/Edit Staff | ✓ | ✓ | ✓ | ✗ |
| Delete Staff | ✓ | ✓ | ✗ | ✗ |
| Manage Stores | ✓ | ✓ | ✗ | ✗ |
| Manage Users | ✓ | ✓ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ |
| Manage Settings | ✓ | ✓ | ✗ | ✗ |

## Migrating from Existing System

If you have data from the old Python/JSON system:

```bash
# 1. Place your old staff_data.json and users.json in the project root
# 2. Run the migration script
npx tsx scripts/migrate-existing-data.ts

# 3. The script generates migration-output.json with all your data
# 4. Use this data to seed your new PostgreSQL database
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Secret for access tokens | - |
| JWT_REFRESH_SECRET | Secret for refresh tokens | - |
| PORT | Backend server port | 3001 |
| CORS_ORIGIN | Allowed frontend origin | http://localhost:3000 |
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_USER | SMTP username | - |
| SMTP_PASS | SMTP password | - |

## Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run build            # Build both
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma client
npm run migrate:data     # Run data migration script
```
