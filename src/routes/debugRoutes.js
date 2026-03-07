const express = require('express');
const leetcodeScraperDebug = require('../scrapers/leetcodeScraper-debug');

const router = express.Router();

// Debug endpoint with visible browser
router.get('/debug/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Username is required',
      message: 'Please provide a valid username'
    });
  }

  console.log(`🎬 Starting DEBUG scrape for LeetCode user: ${username}`);
  console.log(`👀 Browser will be VISIBLE for debugging!`);
  
  try {
    const profileData = await leetcodeScraperDebug.scrapeProfile(username.trim());
    
    console.log(`✅ DEBUG scrape completed for ${username}`);
    console.log(`📊 Results: ${profileData.totalSolved} solved, ${profileData.recentSolved.length} recent`);
    
    res.json({
      ...profileData,
      debug: {
        browser_visible: true,
        slow_motion: true,
        scroll_animation: true,
        console_logging: true
      }
    });
    
  } catch (error) {
    console.error(`❌ DEBUG scrape failed for ${username}:`, error);
    
    if (error.message.includes('Profile not found')) {
      return res.status(404).json({
        error: 'Profile not found',
        message: `The LeetCode profile '${username}' does not exist`
      });
    }
    
    res.status(500).json({
      error: 'Debug scraping failed',
      message: error.message,
      debug: {
        browser_visible: true,
        error_details: error.message
      }
    });
  }
});

// Health check for debug endpoint
router.get('/debug/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Debug LeetCode Scraper',
    browser_mode: 'VISIBLE',
    features: {
      visual_debugging: true,
      slow_motion: true,
      console_logging: true,
      scroll_animation: true
    }
  });
});

module.exports = router;
