const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Create a simple test server to mock the real server
const app = express();

// Basic middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Mock authentication middleware
app.use((req, res, next) => {
  // Skip auth for public endpoints
  if (req.path === '/api' || 
      req.path === '/api/ping' || 
      req.path === '/api/health/status' || 
      req.path === '/api/auth/login' ||
      req.path === '/api/auth/register') {
    return next();
  }
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only');
    
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

// Basic API routes for testing
app.get('/api', (req, res) => {
  res.status(200).json({ name: 'ReadyForms API' });
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong',
    timestamp: new Date()
  });
});

app.get('/api/health/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Import controllers for actual route handlers
const authController = require('../dist/src/controllers/auth.controller');
const userController = require('../dist/src/controllers/user.controller');
const topicController = require('../dist/src/controllers/topic.controller');
const templateController = require('../dist/src/controllers/template.controller');
const responseController = require('../dist/src/controllers/form-response.controller');
const commentController = require('../dist/src/controllers/comment.controller');
const likeController = require('../dist/src/controllers/like.controller');
const adminController = require('../dist/src/controllers/admin.controller');
const dashboardController = require('../dist/src/controllers/dashboard.controller');

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authController.getCurrentUser);
app.put('/api/auth/preferences', authController.updatePreferences);

// Admin middleware for admin-only routes
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Topic routes
app.get('/api/topics', topicController.getAllTopics);
app.get('/api/topics/:id', topicController.getTopicById);
app.post('/api/topics', adminMiddleware, topicController.createTopic);
app.put('/api/topics/:id', adminMiddleware, topicController.updateTopic);
app.delete('/api/topics/:id', adminMiddleware, topicController.deleteTopic);

// Template routes
app.get('/api/templates', templateController.getAllTemplates);
app.get('/api/templates/search', templateController.searchTemplates);
app.get('/api/templates/:id', templateController.getTemplateById);
app.post('/api/templates', templateController.createTemplate);
app.put('/api/templates/:id', templateController.updateTemplate);
app.delete('/api/templates/:id', templateController.deleteTemplate);

// Form response routes
app.post('/api/responses', responseController.createFormResponse);
app.get('/api/responses/template/:templateId', responseController.getFormResponsesByTemplate);
app.get('/api/responses/user', responseController.getFormResponsesByUser);
app.get('/api/responses/aggregate/:templateId', responseController.getAggregateData);
app.get('/api/responses/:id', responseController.getFormResponseById);

// Comment routes
app.post('/api/comments', commentController.createComment);
app.get('/api/comments/template/:templateId', commentController.getCommentsByTemplate);
app.delete('/api/comments/:id', commentController.deleteComment);

// Like routes
app.post('/api/likes/template/:templateId', likeController.toggleLike);
app.get('/api/likes/check/:templateId', likeController.checkLike);
app.get('/api/likes/count/:templateId', likeController.countLikes);
app.get('/api/likes/template/:templateId', likeController.getLikesByTemplate);
app.delete('/api/likes/template/:templateId', likeController.toggleLike);

// Admin routes
app.get('/api/admin/users', adminMiddleware, adminController.getUsers);
app.get('/api/admin/dashboard-stats', adminMiddleware, adminController.getDashboardStats);

// Dashboard routes
app.get('/api/dashboard/stats', dashboardController.getDashboardStats);

// Global error handler for test environment
app.use((err, req, res, next) => {
  console.error('Test server error:', err);
  res.status(500).json({
    message: 'Test server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Create and export server
const server = app.listen(0, () => {
  const address = server.address();
  console.log(`Test server listening on port ${address.port}`);
});

module.exports = server;
