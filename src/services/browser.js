const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

class BrowserService {
  constructor() {
    this.browser = null; // Single browser instance
    this.page = null;  // Single page instance
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized && this.browser) {
      console.log('🔄 Reusing existing browser instance');
      return;
    }

    try {
      console.log('🌐 Initializing single browser instance...');
      
      // Show browser for debugging (remove headless)
      const launchOptions = {
        headless: false, // SHOW BROWSER!
        slowMo: 50, // Slow motion for visibility
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--window-size=1920,1080',
          '--memory-pressure-off',
          '--start-maximized'
        ],
        executablePath: process.platform === 'linux' ? 
          '/usr/bin/google-chrome-stable' : 
          undefined,
        timeout: 30000
      };

      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();
      
      // Set viewport
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      this.isInitialized = true;
      console.log('✅ Single browser instance initialized - REUSABLE!');

    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async getPage() {
    await this.initialize();
    
    // Return the single page instance
    if (this.page) {
      console.log('🔄 Reusing existing page instance');
      return this.page;
    }
    
    // If no page exists, create one
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    return this.page;
  }

  async releasePage(page) {
    try {
      // Don't close the page - just clear it for reuse
      await page.evaluate(() => {
        // Clear page content for next use
        document.body.innerHTML = '';
      });
      console.log('🧹 Page cleared for reuse');
    } catch (error) {
      console.error('Error clearing page:', error);
    }
  }

  async close() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      this.isInitialized = false;
      console.log('🔒 Single browser instance closed');
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}

const browserService = new BrowserService();

module.exports = browserService;
