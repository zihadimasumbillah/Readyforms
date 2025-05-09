# Vercel Deployment Checklist

## Before Deploying

1. **Check Environment Variables**:
   - [ ] `DATABASE_URL` is set correctly and points to your Neon DB
   - [ ] `NODE_ENV` is set to "production"
   - [ ] `CLIENT_URL` includes all allowed frontend origins
   - [ ] `JWT_SECRET` is set to a secure value

2. **Build and Test Locally**:
   ```bash
   npm run build
   NODE_ENV=production DATABASE_URL=your_db_url node vercel.entry.js
   ```

3. **Check Database Connection**:
   - [ ] Database connection works locally with the same connection string
   - [ ] SSL mode is required in the connection string (`?sslmode=require`)

## Deployment Process

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Fixed Vercel deployment configuration"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect repository to Vercel if not already connected
   - Set all required environment variables in Vercel project settings
   - Trigger a new deployment

3. **Check Environment Variables in Vercel**:
   - [ ] `DATABASE_URL` (with correct connection string)
   - [ ] `NODE_ENV` = "production"
   - [ ] `CLIENT_URL` = comma-separated list of allowed origins
   - [ ] `JWT_SECRET` for secure token generation

## Post-Deployment Verification

1. **Check Health Endpoints**:
   - [ ] `https://your-vercel-url.vercel.app/health` returns status: ok
   - [ ] `https://your-vercel-url.vercel.app/api/health/ping` returns status: ok
   - [ ] `https://your-vercel-url.vercel.app/api/health/status` shows database: connected

2. **Test API Endpoints**:
   - [ ] `/api/auth/login` works with valid credentials
   - [ ] Protected routes work with authentication

3. **Debug if Necessary**:
   - [ ] Check Vercel deployment logs for errors
   - [ ] Use `/api/health/debug?debug_token=your_debug_token` to diagnose issues
   - [ ] Verify database connection is established

## Troubleshooting Common Issues

1. **404 Error**:
   - Verify `vercel.json` contains correct configuration
   - Check that `vercel.entry.js` exists and is referenced correctly

2. **Database Connection Errors**:
   - Ensure `DATABASE_URL` environment variable is set correctly
   - Check if your database allows connections from Vercel's IP range
   - Verify SSL settings in connection string

3. **CORS Errors**:
   - Make sure `CLIENT_URL` includes the frontend application URL
   - Verify CORS headers are correctly set in `vercel.json`
