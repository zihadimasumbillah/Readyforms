# ReadyForms - AI-Powered Form Builder SaaS

A modern SaaS form builder with AI-powered form generation, public shareable forms, and comprehensive template management.

## Architecture

- **Frontend**: Next.js 14 (React 18) with TypeScript, Tailwind CSS, Radix UI components
  - Located in `client/`
  - Next.js dev server runs on port 3000 (internal)
  - Uses `next.config.mjs` as the active config file

- **Backend**: Express.js with TypeScript, Sequelize ORM
  - Located in `server/`
  - Runs on port 5000 (main entry point, serves both API and proxies to Next.js)
  - Uses `ts-node --transpile-only` for development
  - REST API mounted at `/api`
  - Proxies all non-API traffic to Next.js via `http-proxy-middleware`

- **Database**: PostgreSQL (Replit built-in)
  - Connected via `DATABASE_URL` environment variable
  - Sequelize ORM with models: User, Template, FormResponse, Topic, Comment, Like, Tag, TemplateTag
  - Auto-syncs tables on server startup

- **AI Integration**: OpenAI via Replit AI Integrations
  - Uses `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` env vars
  - Model: `gpt-5.2` with JSON response format
  - Service: `server/src/services/ai.service.ts`
  - Endpoints: `POST /api/ai/generate-form`, `POST /api/ai/improve-form`

## Running

Both services start via `bash start.sh`:
1. Next.js dev server starts on port 3000
2. Express server starts on port 5000, proxies non-API requests to Next.js

## Key Features

- **AI Form Generation**: Describe a form in natural language, AI generates the structure (uses `max_completion_tokens` for gpt-5.2)
- **Template Builder**: Manual form creation with drag-and-drop field ordering
- **Public Shareable Forms**: `/forms/[id]` for public form filling with share button
- **User Authentication**: JWT-based auth with login/signup
- **Dashboard**: User dashboard with AI quick actions and form management
- **Templates Gallery**: Searchable/filterable by topic with "Create with AI" CTA
- **Pricing Page**: Tiered SaaS pricing (Free/Pro/Enterprise) with AI feature tiers
- **Footer**: Global footer with product/company links (hidden on dashboard/admin)

## Key Files

- `start.sh` - Startup script
- `server/src/server.ts` - Express entry point with Next.js proxy
- `server/src/services/ai.service.ts` - AI form generation service
- `server/src/routes/index.ts` - All API routes registration
- `client/src/app/page.tsx` - SaaS landing page
- `client/src/app/templates/page.tsx` - Template gallery with topic filtering
- `client/src/app/templates/create/page.tsx` - Form builder with AI tab
- `client/src/app/forms/[id]/page.tsx` - Public form filling page
- `client/src/components/ai/ai-form-generator.tsx` - AI form generator component
- `client/src/components/footer.tsx` - Global footer component
- `client/src/components/template/template-card.tsx` - Template card with share button
- `client/src/lib/api/api-config.ts` - API client configuration (uses `/api` relative path, SSR uses port 5000)

## Key Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)
- `PORT` - Set to 3001 in env (overridden to 5000 in server code)
- `JWT_SECRET` - Authentication secret
- `ALLOW_ALL_ORIGINS` - CORS setting
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL (Replit integration)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (Replit integration)
