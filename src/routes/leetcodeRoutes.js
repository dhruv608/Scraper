const express = require('express');
const leetcodeScraper = require('../scrapers/leetcodeScraper');
const browserService = require('../services/browser');

const router = express.Router();

// Simple in-memory cache for LeetCode
const cache = new Map();

// Main endpoint
router.get('/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Username is required',
      message: 'Please provide a valid username'
    });
  }

  const cleanUsername = username.trim();
  
  try {
    console.log(`🎬 Starting LeetCode scrape for ${cleanUsername} - BROWSER WILL BE VISIBLE!`);
    
    // Check cache first
    if (cache.has(cleanUsername)) {
      console.log(`🚀 Cache hit for LeetCode ${cleanUsername}`);
      return res.json(cache.get(cleanUsername));
    }
    
    console.log(`🔍 Scraping LeetCode ${cleanUsername}...`);
    console.log(`👀 Watch the browser window - it will open and scrape live!`);
    
    const profileData = await leetcodeScraper.scrapeProfile(cleanUsername);
    
    // Cache for 10 minutes
    cache.set(cleanUsername, profileData);
    
    // Clean old cache entries periodically
    setTimeout(() => {
      cache.delete(cleanUsername);
    }, 600000); // 10 minutes
    
    console.log(`✅ LeetCode Success: ${profileData.totalSolved} solved, ${profileData.recentSolved.length} recent`);
    
    res.json(profileData);
    
  } catch (error) {
    console.error(`❌ LeetCode Error for ${username}:`, error.message);
    
    if (error.message.includes('Profile not found')) {
      return res.status(404).json({
        error: 'Profile not found',
        message: `The LeetCode profile '${username}' does not exist`
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'The request took too long to complete. Please try again.'
      });
    }
    
    res.status(500).json({
      error: 'Scraping failed',
      message: error.message
    });
  }
});

// Health check for LeetCode scraper
router.get('/leetcode/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'LeetCode Scraper',
    cache_size: cache.size,
    uptime: Math.floor(process.uptime())
  });
});

module.exports = router;
