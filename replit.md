# ReadyForms

A form builder application that lets users create, share, and analyze forms.

## Architecture

- **Frontend**: Next.js 14 (React 18) with TypeScript, Tailwind CSS, Radix UI components
  - Located in `client/`
  - Runs on port 5000 (dev mode)
  - Uses `next.config.mjs` as the active config file
  - API calls proxied to backend via Next.js rewrites

- **Backend**: Express.js with TypeScript, Sequelize ORM
  - Located in `server/`
  - Runs on port 3001
  - Uses `ts-node` for development
  - REST API mounted at `/api`

- **Database**: PostgreSQL (Replit built-in)
  - Connected via `DATABASE_URL` environment variable
  - Sequelize ORM with models: User, Template, FormResponse, Topic, Comment, Like, Tag, TemplateTag
  - Auto-syncs tables on server startup

## Running

Both services start via `bash start.sh` which launches the server and client concurrently.

## Key Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `PORT` - Backend server port (3001)
- `JWT_SECRET` - Authentication secret
- `ALLOW_ALL_ORIGINS` - CORS setting
- `NEXT_PUBLIC_API_URL` - Frontend API base URL
