const express = require('express');
const router = express.Router();

// Basic working routes without database dependencies
router.use((req, res, next) => {
  res.header('X-API-Version', process.env.npm_package_version || '1.0.0');
  next();
});

// Add completely new test endpoint with unique name
router.get('/test-new-endpoint-12345', (req, res) => {
  res.status(200).json({
    message: 'NEW ENDPOINT IS WORKING!',
    success: true,
    timestamp: new Date().toISOString(),
    source: 'JavaScript router'
  });
});

// Add debugging endpoint to list available routes
router.get('/debug-routes', (req, res) => {
  res.status(200).json({
    message: 'Available API routes debug info',
    routes: [
      'GET /api/ping',
      'GET /api/status', 
      'GET /api/templates',
      'GET /api/direct-test',
      'GET /api/debug-routes'
    ],
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add simple direct routes for testing
router.get('/direct-test', (req, res) => {
  res.status(200).json({
    message: 'Direct route test working - updated!',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Add templates route directly in the main router
router.get('/templates', (req, res) => {
  try {
    console.log('📋 Templates endpoint called');
    res.status(200).json({
      message: 'Templates endpoint is working!',
      data: [],
      mockData: [
        {
          id: '1',
          title: 'Sample Quiz Template',
          description: 'This is a test quiz template',
          isPublic: true,
          isQuiz: true,
          createdAt: new Date().toISOString(),
          author: { id: '1', name: 'Test User' },
          topic: { id: '1', name: 'Education' },
          tags: [{ id: '1', name: 'quiz' }, { id: '2', name: 'education' }],
          likesCount: 5,
          commentsCount: 2
        },
        {
          id: '2',
          title: 'Sample Survey Template',
          description: 'This is a test survey template',
          isPublic: true,
          isQuiz: false,
          createdAt: new Date().toISOString(),
          author: { id: '2', name: 'Another User' },
          topic: { id: '2', name: 'Business' },
          tags: [{ id: '3', name: 'survey' }, { id: '4', name: 'business' }],
          likesCount: 8,
          commentsCount: 4
        }
      ],
      timestamp: new Date().toISOString(),
      total: 2,
      page: 1,
      limit: 10
    });
  } catch (error) {
    console.error('❌ Error in templates endpoint:', error);
    res.status(500).json({
      message: 'Error in templates endpoint',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    source: 'router',
    timestamp: new Date().toISOString() 
  });
});

router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    api: 'ReadyForms API',
    source: 'router',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

router.get('/', (req, res) => {
  res.status(200).json({
    name: 'ReadyForms API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
module.exports.default = router;
