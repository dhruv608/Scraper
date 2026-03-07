const express = require('express');
const gfgRoutes = require('./routes/gfgRoutes');
const leetcodeRoutes = require('./routes/leetcodeRoutes');
const healthRoutes = require('./routes/healthRoutes');
const simpleRoutes = require('./routes/simpleRoutes');
const browserService = require('./services/browser');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel serverless export
module.exports = app;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Register routes
app.use('/api', gfgRoutes);
app.use('/api', leetcodeRoutes);
app.use('/api', healthRoutes);
app.use('/api', simpleRoutes);
app.use('/api', simpleRoutes);

// Root info
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Multi-Platform Scraper API',
    platforms: {
      gfg: 'GET /api/gfg/:username',
      leetcode: 'GET /api/leetcode/:username',
      health: 'GET /api/health',
      simple: 'GET /api/simple/leetcode/:username',
      'simple-gfg': 'GET /api/simple/gfg/:username',
      'simple-health': 'GET /api/simple-health'
    },
    examples: {
      gfg: 'GET /api/gfg/striver',
      leetcode: 'GET /api/leetcode/dhruv608',
      debug: 'GET /api/debug/leetcode/dhruv608 (WATCH BROWSER!)'
    },
    cache: '10 minutes',
    performance: 'First: ~60s, Cached: ~0.1s'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Multi-Platform Scraper',
    platforms: ['GFG', 'LeetCode'],
    uptime: Math.floor(process.uptime())
  });
});

// Start server
const startServer = async () => {
  try {
    await browserService.initialize();
    console.log('🚀 Browser ready');
    
    app.listen(PORT, () => {
      console.log(`\n🌟 Multi-Platform Scraper running on http://localhost:${PORT}`);
      console.log(`📖 GFG Usage: curl http://localhost:${PORT}/api/gfg/striver`);
      console.log(`📖 LeetCode Usage: curl http://localhost:${PORT}/api/leetcode/dhruv608`);
      console.log(`💡 First request takes ~60 seconds, then cached for 10 minutes\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await browserService.close();
  process.exit(0);
});

startServer();
