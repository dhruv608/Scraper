const browserService = require('../services/browser');

class LeetCodeScraper {
  async scrapeProfile(username) {
    let page = null;
    
    try {
      console.log(`🔍 Starting scrape for ${username}...`);
      
      // Get page from single browser instance
      page = await browserService.getPage();
      
      console.log(`🌐 Opening LeetCode profile for ${username}...`);
      
      // Go to profile page
      const profileUrl = `https://leetcode.com/u/${username}/`;
      await page.goto(profileUrl, { waitUntil: 'networkidle2' });
      
      console.log(`📄 Page loaded: ${profileUrl}`);
      
      // Wait for page to load
      await page.waitForTimeout(3000);
      
      // Extract total solved
      const totalSolved = await this.extractTotalSolved(page);
      
      // Extract recent solved with visual debugging
      const recentSolved = await this.extractRecentSolved(page);
      
      const result = {
        username,
        platform: 'leetcode',
        totalSolved,
        recentSolved
      };
      
      console.log(`✅ Scraping completed for ${username}:`, result);
      
      // Release page for reuse (don't close browser)
      await browserService.releasePage(page);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error scraping ${username}:`, error);
      
      // Release page if error
      if (page) {
        await browserService.releasePage(page);
      }
      
      throw error;
    }
  }

  async extractTotalSolved(page) {
    try {
      console.log('🔢 Looking for total solved count...');
      
      // Wait for stats to load
      await page.waitForTimeout(2000);
      
      const totalSolved = await page.evaluate(() => {
        // Look for stats in various possible locations
        const selectors = [
          '[data-e2e-locator="total-solved"]',
          '.text-label',
          '[class*="solved"]',
          '[class*="stat"]'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            const text = element.innerText || element.textContent;
            const match = text.match(/(\d+)\s*\/\s*\d+/);
            if (match) {
              console.log(`📊 Found total in selector ${selector}:`, match[1]);
              return parseInt(match[1]);
            }
          }
        }
        
        // Fallback: look for any numbers in stats section
        const statsElements = document.querySelectorAll('[class*="stat"], [class*="solved"]');
        for (const elem of statsElements) {
          const text = elem.innerText || elem.textContent;
          const numbers = text.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            console.log(`📈 Found numbers in stats:`, numbers);
            return parseInt(numbers[0]);
          }
        }
        
        return 0;
      });
      
      console.log(`🎯 Total solved extracted: ${totalSolved}`);
      return totalSolved;
      
    } catch (error) {
      console.error('❌ Error extracting total solved:', error);
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
        
        console.log('🎯 Final problems found:', uniqueProblems);
        return uniqueProblems;
      });

      console.log(`✅ Recent solved extracted: ${recentSolved.length} problems`);
      return recentSolved;
      
    } catch (error) {
      console.error('❌ Error extracting recent solved:', error);
      return [];
    }
  }
}

module.exports = new LeetCodeScraper();
