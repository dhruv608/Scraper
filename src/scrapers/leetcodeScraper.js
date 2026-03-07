const browserService = require('../services/browser');

class LeetCodeScraper {
  constructor() {
    this.baseUrl = 'https://leetcode.com/u';
  }

  async scrapeProfile(username) {
    const page = await browserService.getPage();
    
    try {
      const url = `${this.baseUrl}/${username}/`;
      console.log(`Scraping LeetCode profile: ${url}`);

      console.log('Starting navigation...');
      let response;
      try {
        response = await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 60000 
        });
      } catch (navError) {
        console.log('Navigation failed:', navError.message);
        throw new Error('Profile not found');
      }
      
      console.log('Navigation completed, status:', response?.status());
      
      if (!response) {
        console.log('No response received');
        throw new Error('Profile not found');
      }
      
      if (response.status() === 404) {
        console.log('Response status is 404');
        throw new Error('Profile not found');
      }

      console.log('Waiting for page to load...');
      await page.waitForTimeout(5000);

      const pageContent = await page.content();
      
      if (pageContent.length < 1000) {
        console.log('Page content too short, likely 404');
        throw new Error('Profile not found');
      }

      // Extract total solved count
      const totalSolved = await this.extractTotalSolved(page);
      
      // Extract recent solved problems
      const recentSolved = await this.extractRecentSolved(page);

      return {
        username,
        platform: 'leetcode',
        totalSolved,
        recentSolved
      };

    } catch (error) {
      console.error(`Error scraping profile ${username}:`, error);
      
      if (error.message.includes('Profile not found') || error.message.includes('404')) {
        throw new Error('Profile not found');
      }
      
      if (error.message.includes('Navigation timeout') || error.message.includes('Navigating frame was detached')) {
        throw new Error('Failed to load profile page. The user may not exist or the page structure has changed.');
      }
      
      throw new Error(`Scraping failed: ${error.message}`);
    } finally {
      try {
        await browserService.closePage(page);
      } catch (closeError) {
        console.warn('Error closing page:', closeError);
      }
    }
  }

  async extractTotalSolved(page) {
    try {
      console.log('Extracting total solved count...');
      
      const totalSolved = await page.evaluate(() => {
        // Look for text pattern like "197 / 3860 solved"
        const elements = document.querySelectorAll('*');
        
        for (const el of elements) {
          const text = el.innerText || el.textContent;
          if (text && text.includes('solved')) {
            const match = text.match(/(\d+)\s*\/\s*\d+\s*solved/i);
            if (match) {
              return parseInt(match[1]);
            }
          }
        }
        
        return null;
      });

      if (totalSolved) {
        console.log(`Found total solved: ${totalSolved}`);
        return totalSolved;
      } else {
        console.log('Total solved count not found, using default 0');
        return 0;
      }
    } catch (error) {
      console.error('Error extracting total solved:', error);
      return 0;
    }
  }

  async extractRecentSolved(page) {
    try {
      console.log('🔍 Extracting recent solved problems...');
      console.log('👀 Browser is VISIBLE - watch it work!');
      
      // Wait for React to render and Recent AC section to load
      try {
        await page.waitForSelector('a[href*="/submissions/detail/"]', { timeout: 10000 });
        console.log('✅ Found submission detail links!');
      } catch (e) {
        console.log('⚠️ Submission links not found within timeout, continuing...');
      }
      
      // Scroll page to load all recent submissions
      console.log('📜 Scrolling page to load all recent submissions...');
      
      let previousHeight = 0;
      let scrollAttempts = 0;
      const maxScrollAttempts = 10;
      
      while (scrollAttempts < maxScrollAttempts) {
        console.log(`📜 Scroll attempt ${scrollAttempts + 1}...`);
        
        // Scroll to bottom
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Wait for content to load
        await page.waitForTimeout(2000);
        
        // Check if page height has changed
        const currentHeight = await page.evaluate(() => document.body.scrollHeight);
        
        if (currentHeight === previousHeight) {
          console.log('📏 Page height stable, scrolling complete');
          break;
        }
        
        previousHeight = currentHeight;
        scrollAttempts++;
      }
      
      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      
      await page.waitForTimeout(1000);
      
      const recentSolved = await page.evaluate(() => {
        console.log('Looking for submission detail links after scrolling...');
        
        // Only look for submission detail links - these are the recent AC problems
        const submissionLinks = document.querySelectorAll('a[href*="/submissions/detail/"]');
        console.log(`🔗 Found ${submissionLinks.length} submission links`);
        console.log('👀 Watch browser find these links!');
        
        const problems = [];
        
        // Extract text from each submission link
        for (const link of submissionLinks) {
          const text = link.innerText || link.textContent;
          if (text && text.trim()) {
            // Extract only the first line (problem name) before any newlines or timestamps
            const firstLine = text.split('\n')[0].trim();
            
            if (firstLine && firstLine.length > 0) {
              console.log(`📝 Found problem: "${firstLine}"`);
              problems.push(firstLine);
            }
          }
        }
        
        // Remove duplicates but do NOT limit results
        const uniqueProblems = [...new Set(problems)]
          .filter(p => p && p.length > 0)
          .filter(p => p.length > 2 && p.length < 100) // Reasonable problem name length
          .slice(0); // Remove ALL limits to get all problems
        
        console.log('Final problems from Recent AC:', uniqueProblems);
        return uniqueProblems;
      });

      console.log(`Found ${recentSolved.length} recent solved problems`);
      return recentSolved;
      
    } catch (error) {
      console.error('Error extracting recent solved:', error);
      return [];
    }
  }
}

module.exports = new LeetCodeScraper();
