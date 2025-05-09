# ReadyForms API Server Deployment Guide

## Deploying to Vercel

When deploying the ReadyForms API server to Vercel, ensure you set up the following environment variables in your Vercel project settings:

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string for your PostgreSQL database | `postgres://username:password@host:5432/dbname?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-secret-key` |
| `NODE_ENV` | Environment (should be set to `production`) | `production` |
| `CLIENT_URL` | Comma-separated list of allowed client origins | `https://readyformss.vercel.app,https://readyforms.vercel.app` |
| `ALLOW_ALL_ORIGINS` | Enable CORS for all origins (optional, set to `true` in dev) | `false` |

### Important Notes for Vercel Deployment

1. **Database Connection**:
   - Make sure your database is accessible from Vercel's servers.
   - For Neon DB, ensure you use the connection string with `?sslmode=require`.
   - The deployment will fail if the database connection cannot be established.

2. **Build Settings**:
   - Vercel uses the configuration in `vercel.json`.
   - The build command should be `npm run build`.
   - The output directory should be `dist`.

3. **Troubleshooting**:
   - If deployment fails, check Vercel logs for detailed error messages.
   - Most common issue is incorrect DATABASE_URL environment variable.
   - Ensure all required environment variables are properly set.

## Local Development

For local development:

1. Create a `.env` file based on `.env.example`.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the development server.
