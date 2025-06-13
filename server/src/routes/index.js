const express = require('express');
const router = express.Router();

// Basic working routes without database dependencies
router.use((req, res, next) => {
  res.header('X-API-Version', process.env.npm_package_version || '1.0.0');
  next();
});

// Add simple direct routes for testing
router.get('/direct-test', (req, res) => {
  res.status(200).json({
    message: 'Direct route test working',
    timestamp: new Date().toISOString()
  });
});

router.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    timestamp: new Date().toISOString() 
  });
});

router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    api: 'ReadyForms API',
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
