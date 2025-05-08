import express from 'express';
import cors from 'cors';
import { testConnection } from './models';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import topicRoutes from './routes/topic.routes';
import templateRoutes from './routes/template.routes';
import formResponseRoutes from './routes/form-response.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';
import tagRoutes from './routes/tag.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';
import debugRoutes from './routes/debug.routes';
import { getAggregateData } from './controllers/form-response.controller';
import { authMiddleware } from './middleware/auth.middleware';
import catchAsync from './utils/catchAsync';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to ReadyForms API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

app.get('/api/form-responses/aggregate/:templateId', catchAsync(authMiddleware), catchAsync(getAggregateData));

function registerRoutes(prefix: string, router: express.Router) {
  try {
    if (prefix.includes('://')) {
      console.error(`ROUTE ERROR: '${prefix}' appears to be a URL, not a path prefix!`);
      console.error("Express routes should use path segments only (e.g., '/api/users')");
      return;
    }
    app.use(prefix, router);
    console.log(`✓ Registered routes at: ${prefix}`);
  } catch (error) {
    console.error(`✗ Failed to register routes at ${prefix}:`, error);
  }
}

registerRoutes('/api/auth', authRoutes);
registerRoutes('/api/users', userRoutes);
registerRoutes('/api/topics', topicRoutes);
registerRoutes('/api/templates', templateRoutes);
registerRoutes('/api/form-responses', formResponseRoutes);
registerRoutes('/api/comments', commentRoutes);
registerRoutes('/api/likes', likeRoutes);
registerRoutes('/api/tags', tagRoutes);
registerRoutes('/api/dashboard', dashboardRoutes);
registerRoutes('/api/admin', adminRoutes);
registerRoutes('/api/health', healthRoutes);

if (process.env.NODE_ENV !== 'production') {
  registerRoutes('/api/debug', debugRoutes);
  console.log('Debug routes enabled in development mode');
}

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  if (err instanceof TypeError && err.message.includes('Missing parameter name')) {
    console.error('PATH-TO-REGEXP ERROR: Invalid route pattern detected!');
    console.error('Run: npx ts-node src/utils/run-debug-scan.ts to find problematic routes.');
  }
  
  if (!res.headersSent) {
    res.status(500).json({ message: 'Internal server error' });
  }
  next();
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    const isConnected = await testConnection();
    console.log(`Database connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Database connection error:', error);
  }
});

export default app;