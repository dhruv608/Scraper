const express = require('express');

const router = express.Router();

// Simple mock route for testing
router.get('/simple/:username', async (req, res) => {
  const { username } = req.params;
  
  res.json({
    message: 'Simple test route working',
    username: username,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    note: 'This route does not use Puppeteer - for testing serverless functionality'
  });
});

// Health check without browser dependencies
router.get('/simple-health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Simple Health Check',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    note: 'No browser dependencies - should work in serverless'
  });
});

module.exports = router;
