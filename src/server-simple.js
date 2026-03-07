const express = require('express');
const gfgScraper = require('./scrapers/gfgScraper');
const leetcodeRoutes = require('./routes/leetcodeRoutes');
const browserService = require('./services/browser');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Simple in-memory cache (just a Map)
const cache = new Map();

// GFG endpoint
app.get('/gfg/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Username is required',
      message: 'Please provide a valid username'
    });
  }

  const cleanUsername = username.trim();
  
  try {
    // Check cache first
    if (cache.has(cleanUsername)) {
      console.log(`🚀 Cache hit for ${cleanUsername}`);
      return res.json(cache.get(cleanUsername));
    }
    
    console.log(`🔍 Scraping ${cleanUsername}...`);
    
    const profileData = await gfgScraper.scrapeProfile(cleanUsername);
    
    // Cache for 10 minutes
    cache.set(cleanUsername, profileData);
    
    // Clean old cache entries periodically
    setTimeout(() => {
      cache.delete(cleanUsername);
    }, 600000); // 10 minutes
    
    console.log(`✅ Success: ${profileData.totalSolved} problems found`);
    
    res.json(profileData);
    
  } catch (error) {
    console.error(`❌ Error for ${username}:`, error.message);
    
    if (error.message.includes('Profile not found')) {
      return res.status(404).json({
        error: 'Profile not found',
        message: `The GFG profile '${username}' does not exist`
      });
    }
    
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message
    });
  }
});

// LeetCode routes
app.use('/', leetcodeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Multi-Platform Scraper',
    platforms: ['GFG', 'LeetCode'],
    cache_size: cache.size,
    uptime: Math.floor(process.uptime())
  });
});

// Root info
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Multi-Platform Scraper',
    platforms: {
      gfg: 'GET /gfg/:username',
      leetcode: 'GET /leetcode/:username'
    },
    examples: {
      gfg: 'GET /gfg/striver',
      leetcode: 'GET /leetcode/dhruv608'
    },
    cache: '10 minutes',
    performance: 'First: ~60s, Cached: ~0.1s'
  });
});

// Start server
const startServer = async () => {
  try {
    await browserService.initialize();
    console.log('🚀 Browser ready');
    
    app.listen(PORT, () => {
      console.log(`\n🌟 Multi-Platform Scraper running on http://localhost:${PORT}`);
      console.log(`📖 GFG Usage: curl http://localhost:${PORT}/gfg/striver`);
      console.log(`📖 LeetCode Usage: curl http://localhost:${PORT}/leetcode/dhruv608`);
      console.log(`💡 First request takes ~60 seconds, then cached for 10 minutes\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start:', error);
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
