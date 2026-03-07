const axios = require('axios');

class SimpleScraper {
  constructor() {
    this.baseURL = 'https://scrapercode-api.vercel.app/api';
  }

  async scrapeLeetCode(username) {
    try {
      console.log(`🔍 Simple HTTP scrape for LeetCode user: ${username}`);
      
      // Use a simple HTTP request approach
      const response = await axios.get(`${this.baseURL}/leetcode/${username}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Simple-Scraper/1.0.0'
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error scraping LeetCode ${username}:`, error.message);
      throw error;
    }
  }

  async scrapeGFG(username) {
    try {
      console.log(`🔍 Simple HTTP scrape for GFG user: ${username}`);
      
      // Use a simple HTTP request approach
      const response = await axios.get(`${this.baseURL}/gfg/${username}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Simple-Scraper/1.0.0'
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error scraping GFG ${username}:`, error.message);
      throw error;
    }
  }
}

module.exports = new SimpleScraper();
