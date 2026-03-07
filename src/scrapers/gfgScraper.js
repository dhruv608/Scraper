const browserService = require('../services/browser');

class GFGScraper {
  constructor() {
    this.baseUrl = 'https://www.geeksforgeeks.org/profile';
    this.difficulties = ['SCHOOL', 'BASIC', 'EASY', 'MEDIUM', 'HARD'];
    this.difficultyMapping = {
      'SCHOOL': 'basic',
      'BASIC': 'basic',
      'EASY': 'easy',
      'MEDIUM': 'medium',
      'HARD': 'hard'
    };
  }

  async scrapeProfile(username) {
    const page = await browserService.getPage();
    
    try {
      const url = `${this.baseUrl}/${username}?tab=activity`;
      console.log(`Scraping GFG profile: ${url}`);

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

      await this.waitForProblemsBreakdown(page);

      const totalSolved = await this.extractTotalSolved(page);
      
      const problems = await this.extractProblemsByDifficulty(page);

      return {
        username,
        platform: 'gfg',
        totalSolved,
        problems: {
          basic: problems.basic || [],
          easy: problems.easy || [],
          medium: problems.medium || [],
          hard: problems.hard || []
        }
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

  async waitForProblemsBreakdown(page) {
    try {
      await page.waitForFunction(
        () => document.body.innerText.includes('Problems Breakdown'),
        { timeout: 10000 }
      );
    } catch (error) {
      throw new Error('Problems Breakdown section not found. Profile may not exist or structure has changed.');
    }
  }

  async extractTotalSolved(page) {
    try {
      const totalText = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          if (el.innerText && el.innerText.includes('Total Problems :')) {
            return el.innerText;
          }
        }
        return null;
      });

      if (totalText) {
        const match = totalText.match(/Total Problems\s*:\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }
      
      return 0;
    } catch (error) {
      console.warn('Could not extract total solved count:', error);
      return 0;
    }
  }

  async extractProblemsByDifficulty(page) {
    const problems = {
      basic: [],
      easy: [],
      medium: [],
      hard: []
    };

    for (const difficulty of this.difficulties) {
      try {
        console.log(`Extracting ${difficulty} problems...`);
        
        const tabClicked = await this.clickDifficultyTab(page, difficulty);
        if (!tabClicked) {
          console.warn(`Could not find or click ${difficulty} tab`);
          continue;
        }

        await page.waitForTimeout(1000);

        const difficultyProblems = await this.scrollAndExtractProblems(page, difficulty);
        const mappedDifficulty = this.difficultyMapping[difficulty];
        
        if (mappedDifficulty && difficultyProblems.length > 0) {
          problems[mappedDifficulty] = difficultyProblems;
        }

        console.log(`Found ${difficultyProblems.length} ${difficulty} problems`);
        
      } catch (error) {
        console.warn(`Error extracting ${difficulty} problems:`, error);
      }
    }

    return problems;
  }

  async clickDifficultyTab(page, difficulty) {
    return await page.evaluate((diff) => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.innerText && el.innerText.trim().toUpperCase().includes(diff.toUpperCase())) {
          const isClickable = el.tagName === 'BUTTON' || 
                            el.tagName === 'A' || 
                            el.onclick !== null ||
                            el.role === 'button' ||
                            window.getComputedStyle(el).cursor === 'pointer';
          
          if (isClickable) {
            el.click();
            return true;
          }
          
          const clickableParent = el.closest('button, a, [onclick], [role="button"], li, div');
          if (clickableParent) {
            const parentStyle = window.getComputedStyle(clickableParent);
            if (parentStyle.cursor === 'pointer' || clickableParent.onclick) {
              clickableParent.click();
              return true;
            }
          }
        }
      }
      return false;
    }, difficulty);
  }

  async scrollAndExtractProblems(page, difficulty) {
    return await page.evaluate((diff) => {
      const problems = [];
      
      let scrollContainer = null;
      
      const containers = document.querySelectorAll('div');
      for (const container of containers) {
        const style = window.getComputedStyle(container);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
          const hasProblemList = container.querySelector('ul');
          if (hasProblemList) {
            scrollContainer = container;
            break;
          }
        }
      }

      if (!scrollContainer) {
        const problemSections = document.querySelectorAll('*');
        for (const section of problemSections) {
          if (section.innerText && section.innerText.includes('Problems Breakdown')) {
            const parent = section.parentElement;
            if (parent) {
              const scrollableDivs = parent.querySelectorAll('div');
              for (const div of scrollableDivs) {
                const style = window.getComputedStyle(div);
                if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
                  scrollContainer = div;
                  break;
                }
              }
            }
            if (scrollContainer) break;
          }
        }
      }

      if (!scrollContainer) {
        return problems;
      }

      let previousScrollHeight = 0;
      let currentScrollHeight = scrollContainer.scrollHeight;
      
      while (currentScrollHeight !== previousScrollHeight) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
        
        previousScrollHeight = currentScrollHeight;
        
        setTimeout(() => {
          currentScrollHeight = scrollContainer.scrollHeight;
        }, 500);
        
        let attempts = 0;
        while (attempts < 10) {
          if (scrollContainer.scrollHeight !== previousScrollHeight) {
            currentScrollHeight = scrollContainer.scrollHeight;
            break;
          }
          attempts++;
        }
      }

      const problemLists = scrollContainer.querySelectorAll('ul');
      for (const list of problemLists) {
        const problemItems = list.querySelectorAll('li');
        for (const item of problemItems) {
          const link = item.querySelector('a');
          if (link && link.href && link.innerText.trim()) {
            problems.push({
              title: link.innerText.trim(),
              url: link.href,
              difficulty: diff.toLowerCase()
            });
          }
        }
      }

      return problems;
    }, difficulty);
  }
}

module.exports = new GFGScraper();
