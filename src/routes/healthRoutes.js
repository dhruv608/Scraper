const express = require('express');

const router = express.Router();

// Simple health check without browser
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Multi-Platform Scraper API',
    version: '1.0.0',
    platforms: ['LeetCode', 'GeeksforGeeks'],
    endpoints: {
      leetcode: '/api/leetcode/:username',
      gfg: '/api/gfg/:username'
    },
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    note: 'Lightweight health check - no browser dependencies'
  });
});

// Test endpoint without browser
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working without browser dependencies',
    test: 'success',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
