const express = require('express');
const gfgScraper = require('../scrapers/gfgScraper');
const browserService = require('../services/browser');

const router = express.Router();

// Simple in-memory cache for GFG
const cache = new Map();

// Main endpoint
router.get('/gfg/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Username is required',
      message: 'Please provide a valid username'
    });
  }

  const cleanUsername = username.trim();
  
  try {
    console.log(`🎬 Starting GFG scrape for ${cleanUsername} - BROWSER WILL BE VISIBLE!`);
    
    // Check cache first
    if (cache.has(cleanUsername)) {
      console.log(`🚀 Cache hit for GFG ${cleanUsername}`);
      return res.json(cache.get(cleanUsername));
    }
    
    console.log(`🔍 Scraping GFG ${cleanUsername}...`);
    console.log(`👀 Watch the browser window - it will open and scrape live!`);
    
    const profileData = await gfgScraper.scrapeProfile(cleanUsername);
    
    // Cache for 10 minutes
    cache.set(cleanUsername, profileData);
    
    // Clean old cache entries periodically
    setTimeout(() => {
      cache.delete(cleanUsername);
    }, 600000); // 10 minutes
    
    console.log(`✅ GFG Success: ${profileData.totalSolved} solved`);
    
    res.json(profileData);
    
  } catch (error) {
    console.error(`❌ GFG Error for ${username}:`, error);
    
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

// Health check
router.get('/api/gfg/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'GFG Scraper',
    cache_size: cache.size,
    uptime: Math.floor(process.uptime())
  });
});

module.exports = router;


