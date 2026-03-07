const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

class BrowserService {
  constructor() {
    this.browsers = [];
    this.availableBrowsers = [];
    this.maxPoolSize = 1; // Reduced for Vercel serverless
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log(`Initializing browser pool with ${this.maxPoolSize} instances...`);
      
      // Vercel-specific configuration
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--window-size=1920,1080'
        ]
      };

      const browser = await puppeteer.launch(launchOptions);
      this.browsers.push(browser);
      this.availableBrowsers.push(browser);

      this.isInitialized = true;
      console.log('Browser pool initialized successfully');

    } catch (error) {
      console.error('Failed to initialize browser pool:', error);
      throw error;
    }
  }

  async getPageFromBrowser(browser) {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set timeouts
    page.setDefaultTimeout(45000);
    page.setDefaultNavigationTimeout(45000);
    
    return page;
  }

  async getPage() {
    await this.initialize();
    
    if (this.availableBrowsers.length > 0) {
      const browser = this.availableBrowsers.pop();
      return await this.getPageFromBrowser(browser);
    }
    
    // If no browsers available, use the first one
    return await this.getPageFromBrowser(this.browsers[0]);
  }

  async releasePage(page) {
    try {
      await page.close();
    } catch (error) {
      console.error('Error closing page:', error);
    }
  }

  async close() {
    try {
      for (const browser of this.browsers) {
        await browser.close();
      }
      this.browsers = [];
      this.availableBrowsers = [];
      this.isInitialized = false;
      console.log('Browser pool closed successfully');
    } catch (error) {
      console.error('Error closing browser pool:', error);
    }
  }
}

const browserService = new BrowserService();

module.exports = browserService;
