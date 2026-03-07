const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

class BrowserService {
  constructor() {
    this.browsers = [];
    this.availableBrowsers = [];
    this.maxPoolSize = 2; // Simple setup
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log(`Initializing browser pool with ${this.maxPoolSize} instances...`);
      
      for (let i = 0; i < this.maxPoolSize; i++) {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-default-browser-check',
            '--window-size=1920,1080',
            '--memory-pressure-off',
            '--max_old_space_size=4096'
          ]
        });
        
        this.browsers.push(browser);
        this.availableBrowsers.push(browser);
      }
      
      this.isInitialized = true;
      console.log('Browser pool initialized successfully');
    } catch (error) {
      console.error('Failed to initialize browser pool:', error);
      throw error;
    }
  }

  async getPage() {
    await this.initialize();
    
    // Wait for available browser
    while (this.availableBrowsers.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const browser = this.availableBrowsers.pop();
    
    if (!browser || !browser.isConnected()) {
      // Replace disconnected browser
      const newBrowser = await this.createFreshBrowser();
      this.browsers.push(newBrowser);
      this.availableBrowsers.push(newBrowser);
      return this.getPageFromBrowser(newBrowser);
    }
    
    return this.getPageFromBrowser(browser);
  }

  async getPageFromBrowser(browser) {
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // Set timeouts
    page.setDefaultTimeout(45000);
    page.setDefaultNavigationTimeout(45000);
    
    // Handle page close to return browser to pool
    page.on('close', () => {
      if (this.browsers.includes(browser)) {
        this.availableBrowsers.push(browser);
      }
    });
    
    return page;
  }

  async createFreshBrowser() {
    return await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });
  }

  async closePage(page) {
    if (page && !page.isClosed()) {
      await page.close();
    }
  }

  async close() {
    for (const browser of this.browsers) {
      if (browser && browser.isConnected()) {
        await browser.close();
      }
    }
    this.browsers = [];
    this.availableBrowsers = [];
    this.isInitialized = false;
    console.log('Browser pool closed');
  }

  getPoolStats() {
    return {
      total: this.browsers.length,
      available: this.availableBrowsers.length,
      inUse: this.browsers.length - this.availableBrowsers.length
    };
  }
}

module.exports = new BrowserService();
