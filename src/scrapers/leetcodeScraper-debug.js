const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

class LeetCodeScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async scrapeProfile(username) {
    try {
      console.log(`🔍 Starting scrape for ${username}...`);
      
      // Launch browser with visual debugging
      this.browser = await puppeteer.launch({
        headless: false, // SHOW BROWSER FOR DEBUGGING!
        slowMo: 100, // Slow down for visibility
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1920,1080',
          '--start-maximized'
        ]
      });

      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      console.log(`🌐 Opening LeetCode profile for ${username}...`);
      
      // Go to profile page
      const url = `https://leetcode.com/u/${username}/`;
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      
      console.log(`📄 Page loaded: ${url}`);
      
      // Wait for page to load
      await this.page.waitForTimeout(3000);
      
      // Extract total solved
      const totalSolved = await this.extractTotalSolved();
      
      // Extract recent solved with visual debugging
      const recentSolved = await this.extractRecentSolved();
      
      const result = {
        username,
        platform: 'leetcode',
        totalSolved,
        recentSolved
      };
      
      console.log(`✅ Scraping completed for ${username}:`, result);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error scraping ${username}:`, error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async extractTotalSolved() {
    try {
      console.log('🔢 Looking for total solved count...');
      
      // Wait for stats to load
      await this.page.waitForTimeout(2000);
      
      const totalSolved = await this.page.evaluate(() => {
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

  async extractRecentSolved() {
    try {
      console.log('🔍 Looking for recent solved problems...');
      
      // Scroll to load all content
      console.log('📜 Scrolling page to load all content...');
      
      let previousHeight = 0;
      let scrollAttempts = 0;
      const maxScrollAttempts = 5;
      
      while (scrollAttempts < maxScrollAttempts) {
        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        await this.page.waitForTimeout(2000);
        
        const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);
        
        if (currentHeight === previousHeight) {
          console.log('📏 Page height stable, scrolling complete');
          break;
        }
        
        previousHeight = currentHeight;
        scrollAttempts++;
        console.log(`📜 Scroll attempt ${scrollAttempts}: height = ${currentHeight}`);
      }
      
      // Wait for submission links
      console.log('⏳ Waiting for submission links to load...');
      await this.page.waitForTimeout(3000);
      
      const recentSolved = await this.page.evaluate(() => {
        console.log('🔍 Looking for submission detail links...');
        
        // Find all submission detail links
        const submissionLinks = document.querySelectorAll('a[href*="/submissions/detail/"]');
        console.log(`🔗 Found ${submissionLinks.length} submission links`);
        
        const problems = [];
        
        // Extract text from each submission link
        for (let i = 0; i < submissionLinks.length; i++) {
          const link = submissionLinks[i];
          const text = link.innerText || link.textContent;
          
          if (text && text.trim()) {
            // Extract only the first line (problem name) before any newlines or timestamps
            const firstLine = text.split('\n')[0].trim();
            
            if (firstLine && firstLine.length > 0) {
              console.log(`📝 Problem ${i + 1}: "${firstLine}"`);
              problems.push(firstLine);
            }
          }
        }
        
        // Remove duplicates
        const uniqueProblems = [...new Set(problems)]
          .filter(p => p && p.length > 0)
          .filter(p => p.length > 2 && p.length < 100)
          .slice(0, 10); // Limit to 10 for debugging
        
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

  async cleanup() {
    try {
      if (this.page) {
        console.log('🔒 Closing page...');
        await this.page.close();
      }
      
      if (this.browser) {
        console.log('🔒 Closing browser...');
        await this.browser.close();
      }
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

module.exports = new LeetCodeScraper();
