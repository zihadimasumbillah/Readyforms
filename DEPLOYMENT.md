# ReadyForms — Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the ReadyForms application to Vercel, including environment variables, third-party OAuth setup, and database configuration.

---

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Neon](https://neon.tech) PostgreSQL database (or any managed Postgres)
- A [Google Cloud Console](https://console.cloud.google.com/) project for OAuth
- A [GitHub OAuth App](https://github.com/settings/developers) for OAuth
- Git installed locally

---

## Architecture Overview

ReadyForms is deployed as **two separate Vercel projects**:

| Project | Root Directory | Framework | Purpose |
|---------|---------------|-----------|---------|
| **readyforms-client** | `client/` | Next.js 14 | Frontend (SSR, routing, auth pages) |
| **readyforms-api** | `server/` | Express.js | Backend API (serverless functions) |

The frontend proxies API calls to the backend via Vercel rewrites.

---

## Step 1: Deploy the Backend (readyforms-api)

### 1.1 Create a New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import the `Readyforms` repository
3. Set **Root Directory** to `server`
4. Framework Preset: **Other**
5. Build Command: `npm run vercel-build`
6. Output Directory: `dist`
7. Install Command: `npm install`

### 1.2 Backend Environment Variables

Add the following environment variables in the Vercel dashboard under **Settings > Environment Variables**:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Server port (default `3000`) | Yes |
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `DATABASE_URL_UNPOOLED` | Neon unpooled connection string | Yes |
| `USE_DIRECT_URL` | Set to `true` | Yes |
| `JWT_SECRET` | 256-bit secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiration (default `24h`) | Yes |
| `CLIENT_URL` | Frontend URL (e.g., `https://readyforms.vercel.app`) | Yes |
| `ALLOW_ALL_ORIGINS` | Set to `false` in production | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |
| `API_BASE_URL` | Backend API base URL | Yes |

#### Generate JWT_SECRET

```bash
openssl rand -hex 32
```

### 1.3 Deploy

Click **Deploy**. Vercel will build and deploy the Express server as serverless functions.

After deployment, copy the production API URL (e.g., `https://readyforms-api.vercel.app`).

---

## Step 2: Deploy the Frontend (readyforms-client)

### 2.1 Create a New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import the `Readyforms` repository
3. Set **Root Directory** to `client`
4. Framework Preset: **Next.js**
5. Build Command: `next build` (default)
6. Output Directory: `.next` (default)

### 2.2 Frontend Environment Variables

Add the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., `https://readyforms-api.vercel.app/api`) | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |
| `NEXT_PUBLIC_APP_VERSION` | App version | No |
| `NEXT_PUBLIC_ENABLE_DEBUG` | Set to `false` in production | No |
| `NEXT_PUBLIC_API_CREDENTIALS` | Set to `false` | No |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) | Yes |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Yes |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Yes |
| `AUTH_GITHUB_ID` | GitHub OAuth Client ID | Yes |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret | Yes |

### 2.3 Deploy

Click **Deploy**. The frontend will be deployed as a Next.js application.

---

## Step 3: Configure OAuth Providers

### 3.1 Google OAuth 2.0 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Go to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   - `https://readyforms.vercel.app/api/auth/callback/google`
   - `http://localhost:8000/api/auth/callback/google` (for local development)
7. Copy the **Client ID** and **Client Secret** to your Vercel environment variables

### 3.2 GitHub OAuth 2.0 Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: ReadyForms
   - **Homepage URL**: `https://readyforms.vercel.app`
   - **Authorization callback URL**: `https://readyforms.vercel.app/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret** to your Vercel environment variables

---

## Step 4: Configure Database (Neon Postgres)

### 4.1 Create a Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the **Connection string** and **Pooled connection string**

### 4.2 Run Database Migrations

After deployment, run migrations against the production database:

```bash
# Install server dependencies
cd server
npm install

# Set environment variables
export DATABASE_URL="your-neon-connection-string"
export DATABASE_URL_UNPOOLED="your-neon-unpooled-connection-string"

# Run migrations
npm run add-columns
```

### 4.3 Seed Admin User (Optional)

```bash
npm run seed
```

---

## Step 5: Configure Custom Domains (Optional)

### 5.1 Frontend Custom Domain

1. In your frontend Vercel project, go to **Settings > Domains**
2. Add your custom domain (e.g., `readyforms.com`)
3. Update DNS records as instructed by Vercel

### 5.2 Backend Custom Domain

1. In your backend Vercel project, go to **Settings > Domains**
2. Add your API domain (e.g., `api.readyforms.com`)
3. Update the `NEXT_PUBLIC_API_URL` in the frontend to point to the new domain

---

## Step 6: Verify Deployment

### 6.1 Health Checks

```bash
# Backend health
curl https://readyforms-api.vercel.app/health

# Frontend
curl https://readyforms.vercel.app
```

### 6.2 Test OAuth Flow

1. Navigate to `https://readyforms.vercel.app/auth/login`
2. Click **Sign in with Google** or **Sign in with GitHub**
3. Complete the OAuth flow
4. Verify redirect to `/dashboard`

### 6.3 Test Protected Routes

1. Try accessing `/admin` without authentication — should redirect to login
2. Log in as an admin user — should access admin panel
3. Log in as a regular user — should be redirected from `/admin` to `/dashboard`

---

## Step 7: Environment Variables Reference

### Backend (readyforms-api)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:password@host:5432/dbname
DATABASE_URL_UNPOOLED=postgres://user:password@host:5432/dbname
USE_DIRECT_URL=true
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRES_IN=24h
CLIENT_URL=https://readyforms.vercel.app
ALLOW_ALL_ORIGINS=false
OPENAI_API_KEY=sk-...
API_BASE_URL=https://readyforms-api.vercel.app
```

### Frontend (readyforms-client)

```env
NEXT_PUBLIC_API_URL=https://readyforms-api.vercel.app/api
NEXT_PUBLIC_APP_NAME=ReadyForms
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_API_CREDENTIALS=false
AUTH_SECRET=your-nextauth-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
```

---

## Step 8: CI/CD Configuration

Vercel automatically deploys on every push to the `main` branch. To configure preview deployments for pull requests:

1. Go to **Project Settings > Git**
2. Enable **Preview Deployments**
3. Configure branch protection rules in GitHub

---

## Step 9: Monitoring and Analytics

### 9.1 Vercel Analytics

Vercel Analytics is already integrated (`@vercel/analytics`). View analytics in the Vercel dashboard under the **Analytics** tab.

### 9.2 Error Tracking

Consider adding [Sentry](https://sentry.io) or [LogRocket](https://logrocket.com) for error tracking:

```bash
npm install @sentry/nextjs
```

### 9.3 Performance Monitoring

Use Vercel's built-in **Speed Insights** to monitor Core Web Vitals.

---

## Troubleshooting

### Issue: 400 Error on Push

If you encounter `RPC failed; HTTP 400` when pushing to GitHub:
1. Check for large files in git history: `git lfs ls-files`
2. Use SSH instead of HTTPS: `git remote set-url origin git@github.com:user/repo.git`
3. Increase Git buffer: `git config http.postBuffer 524288000`

### Issue: CORS Errors

Ensure `CLIENT_URL` in the backend matches the frontend URL exactly (including `https://` and no trailing slash).

### Issue: OAuth Redirect Mismatch

Verify the redirect URIs in Google Cloud Console and GitHub OAuth settings match the deployed URL exactly.

### Issue: Database Connection Failures

Ensure `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are correctly set in Vercel environment variables. Check that the Neon database allows connections from Vercel IPs.

---

## Security Checklist

- [ ] `ALLOW_ALL_ORIGINS=false` in production
- [ ] `NEXT_PUBLIC_ENABLE_DEBUG=false` in production
- [ ] Strong `JWT_SECRET` (256-bit random string)
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] OAuth secrets stored in Vercel env vars, not in code
- [ ] Database credentials rotated regularly
- [ ] CORS restricted to known origins

---

## Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/zihadimasumbillah/Readyforms/issues).
