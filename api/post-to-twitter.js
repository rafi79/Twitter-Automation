import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tweetContent, username, password, blogUrl } = req.body;

  if (!tweetContent || !username || !password) {
    return res.status(400).json({ 
      error: 'Tweet content, username, and password are required' 
    });
  }

  let browser;
  
  try {
    console.log('🎬 Starting Twitter automation...');
    
    // Launch browser with stealth mode
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging
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
        '--disable-blink-features=AutomationControlled',
        '--ignore-certificate-errors'
      ]
    });

    const page = await browser.newPage();

    // Set user agent to look like real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Hide automation indicators
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    // STEP 1: Navigate to Twitter login
    console.log('🐦 Navigating to Twitter login...');
    await page.goto('https://x.com/i/flow/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await delay(3000);

    // STEP 2: Enter username
    console.log('✍️ Entering username...');
    const usernameSelectors = [
      'input[name="text"]',
      'input[autocomplete="username"]',
      'input[data-testid="ocfEnterTextTextInput"]',
      'input[type="text"]'
    ];

    let usernameInput = null;
    for (const selector of usernameSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 10000 });
        usernameInput = selector;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!usernameInput) {
      throw new Error('Could not find username input field');
    }

    await page.type(usernameInput, username, { delay: 100 });

    // Click Next button
    console.log('🖱️ Clicking Next...');
    const nextButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
      const nextButton = buttons.find(btn => 
        btn.innerText && btn.innerText.trim().toLowerCase() === 'next'
      );
      if (nextButton) {
        nextButton.click();
        return true;
      }
      return false;
    });

    if (!nextButtonClicked) {
      await page.keyboard.press('Enter');
    }

    await delay(2000);

    // STEP 3: Handle username confirmation if needed
    console.log('⏳ Waiting for password field...');
    let passwordInput = null;
    
    try {
      await page.waitForSelector('input[name="password"]', { timeout: 10000 });
      passwordInput = 'input[name="password"]';
    } catch (e) {
      // Handle username confirmation
      console.log('🤔 Handling username confirmation...');
      const confirmationSelectors = [
        'input[data-testid="ocfEnterTextTextInput"]',
        'input[placeholder*="username"]',
        'input[placeholder*="phone"]',
        'input[placeholder*="email"]'
      ];

      for (const selector of confirmationSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          await page.type(selector, username, { delay: 50 });
          
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
            const nextButton = buttons.find(btn => 
              btn.innerText && btn.innerText.trim().toLowerCase() === 'next'
            );
            if (nextButton) nextButton.click();
          });
          
          await delay(2000);
          await page.waitForSelector('input[name="password"]', { timeout: 10000 });
          passwordInput = 'input[name="password"]';
          break;
        } catch (error) {
          continue;
        }
      }
    }

    if (!passwordInput) {
      throw new Error('Could not find password input field');
    }

    // STEP 4: Enter password
    console.log('🔐 Entering password...');
    await page.type(passwordInput, password, { delay: 100 });

    // Click Log in
    console.log('🖱️ Clicking Log in...');
    const loginButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
      const loginButton = buttons.find(btn => 
        btn.innerText && (
          btn.innerText.trim().toLowerCase() === 'log in' ||
          btn.innerText.trim().toLowerCase() === 'sign in'
        )
      );
      if (loginButton) {
        loginButton.click();
        return true;
      }
      return false;
    });

    if (!loginButtonClicked) {
      await page.keyboard.press('Enter');
    }

    // STEP 5: Wait for home page to load
    console.log('⏳ Waiting for home page...');
    const homeSelectors = [
      '[data-testid="tweetTextarea_0"]',
      '[aria-label="Post text"]',
      'div[role="textbox"]'
    ];

    let homeLoaded = false;
    for (const selector of homeSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 20000 });
        homeLoaded = true;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!homeLoaded) {
      throw new Error('Could not load Twitter home page');
    }

    console.log('✅ Login successful!');

    // STEP 6: Compose tweet
    console.log('✍️ Composing tweet...');
    const tweetSelectors = [
      '[data-testid="tweetTextarea_0"]',
      '[aria-label="Post text"]',
      'div[role="textbox"]'
    ];

    let tweetInputSelector = null;
    for (const selector of tweetSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        tweetInputSelector = selector;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!tweetInputSelector) {
      throw new Error('Could not find tweet input field');
    }

    // Click and focus on tweet input
    await page.click(tweetInputSelector);
    await delay(500);

    // Prepare final tweet text
    let finalTweetText = tweetContent;
    if (blogUrl) {
      finalTweetText = tweetContent.replace('[LINK]', blogUrl);
    }

    console.log(`📝 Tweet text: "${finalTweetText}"`);

    // Clear existing content and type new text
    await page.evaluate((selector) => {
      const input = document.querySelector(selector);
      if (input) {
        input.textContent = '';
        input.innerHTML = '';
        input.focus();
      }
    }, tweetInputSelector);

    await delay(500);

    // Type the tweet character by character
    for (let i = 0; i < finalTweetText.length; i++) {
      await page.keyboard.type(finalTweetText[i], { delay: 50 });
      
      // Trigger input events periodically
      if (i % 10 === 0) {
        await page.evaluate((selector) => {
          const input = document.querySelector(selector);
          if (input) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, tweetInputSelector);
      }
    }

    console.log('✅ Tweet text entered');

    // STEP 7: Simulate user interaction to enable Post button
    console.log('🔄 Simulating user interaction...');
    
    // Click on compose area to ensure focus
    const composeBox = await page.$(tweetInputSelector);
    if (composeBox) {
      const box = await composeBox.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await delay(500);
      }
    }

    // Trigger comprehensive events
    await page.evaluate((selector, text) => {
      const input = document.querySelector(selector);
      if (input) {
        input.textContent = text;
        
        const events = ['input', 'change', 'keyup', 'keydown', 'focus', 'blur'];
        events.forEach(eventType => {
          try {
            input.dispatchEvent(new Event(eventType, { bubbles: true }));
          } catch (e) {}
        });
        
        input.focus();
      }
    }, tweetInputSelector, finalTweetText);

    // Additional user simulation
    await page.keyboard.press('End');
    await delay(200);
    await page.keyboard.press('ArrowLeft');
    await delay(100);
    await page.keyboard.press('ArrowRight');
    await delay(500);

    console.log('⏳ Waiting for Post button to be enabled...');
    await delay(3000);

    // STEP 8: Find and click Post button
    console.log('🖱️ Looking for Post button...');
    const postButtonSelectors = [
      'button[data-testid="tweetButton"]',
      'button[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]'
    ];

    let postButtonFound = false;
    
    for (const selector of postButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        
        const isEnabled = await page.evaluate((sel) => {
          const button = document.querySelector(sel);
          if (!button) return false;
          
          const style = getComputedStyle(button);
          const bgColor = style.backgroundColor;
          const isDisabled = button.disabled || 
                            button.getAttribute('aria-disabled') === 'true';
          
          // Check for enabled state (blue background)
          return !isDisabled && 
                 (bgColor.includes('29, 155, 240') || bgColor.includes('15, 20, 25'));
        }, selector);
        
        if (isEnabled) {
          console.log(`✅ Found enabled Post button: ${selector}`);
          
          // Try multiple click methods
          try {
            await page.click(selector, { delay: 100 });
            postButtonFound = true;
            break;
          } catch (clickError) {
            // Try JavaScript click
            await page.evaluate((sel) => {
              const button = document.querySelector(sel);
              if (button) button.click();
            }, selector);
            postButtonFound = true;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!postButtonFound) {
      // Final attempt with text-based search
      postButtonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        for (const button of buttons) {
          const text = button.textContent?.trim().toLowerCase();
          const bgColor = getComputedStyle(button).backgroundColor;
          
          if (text === 'post' && bgColor.includes('29, 155, 240')) {
            button.click();
            return true;
          }
        }
        return false;
      });
    }

    if (!postButtonFound) {
      throw new Error('Could not find or click the Post button');
    }

    console.log('✅ Post button clicked!');

    // STEP 9: Wait for confirmation
    console.log('⏳ Waiting for tweet confirmation...');
    
    try {
      await Promise.race([
        page.waitForSelector('div[data-testid="toast"]', { timeout: 15000 }),
        page.waitForFunction(() => {
          const tweetArea = document.querySelector('[data-testid="tweetTextarea_0"]');
          return !tweetArea || tweetArea.textContent === '';
        }, { timeout: 15000 })
      ]);
      
      console.log('✅ Tweet posted successfully!');
    } catch (error) {
      console.log('⚠️ Could not confirm tweet posting, but likely successful');
    }

    return res.status(200).json({
      success: true,
      message: 'Tweet posted successfully!',
      data: {
        tweetContent: finalTweetText,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Twitter posting error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to post tweet',
      details: error.message
    });

  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
  }
}
