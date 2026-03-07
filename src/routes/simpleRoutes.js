const express = require('express');
const simpleScraper = require('./simpleScraper');

const router = express.Router();

// Simple LeetCode endpoint (no Puppeteer)
router.get('/simple/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Username is required',
      message: 'Please provide a valid username'
    });
  }

  try {
    console.log(`🌐 Simple HTTP scrape for ${username}`);
    const data = await simpleScraper.scrapeLeetCode(username.trim());
    
    res.json({
      ...data,
      method: 'simple_http',
      note: 'No Puppeteer - works on Vercel serverless',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Simple scrape error for ${username}:`, error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Profile not found',
        message: `The LeetCode profile '${username}' does not exist`
      });
    }
    
    res.status(500).json({
      error: 'Simple scraping failed',
      message: error.message
    });
  }
});

// Simple GFG endpoint (no Puppeteer)
router.get('/simple/gfg/:username', async (req, res) => {
  const { username } = req.params;
  
  if (!username || username.trim().length === 0) {
    return res.status(400).json({
      error: 'Username is required',
      message: 'Please provide a valid username'
    });
  }

  try {
    console.log(`🌐 Simple HTTP scrape for ${username}`);
    const data = await simpleScraper.scrapeGFG(username.trim());
    
    res.json({
      ...data,
      method: 'simple_http',
      note: 'No Puppeteer - works on Vercel serverless',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Simple scrape error for ${username}:`, error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Profile not found',
        message: `The GFG profile '${username}' does not exist`
      });
    }
    
    res.status(500).json({
      error: 'Simple scraping failed',
      message: error.message
    });
  }
});

// Health check for simple scraper
router.get('/simple-health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Simple HTTP Scraper',
    version: '1.0.0',
    method: 'http_only',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    note: 'No browser dependencies - works on any serverless platform',
    endpoints: {
      leetcode: '/api/simple/leetcode/:username',
      gfg: '/api/simple/gfg/:username',
      health: '/api/simple-health'
    }
  });
});

module.exports = router;
