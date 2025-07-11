const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();
const {
  fetchRevisionHistory,
  parseActivityHtmlList
} = require('../helpers/scraper');

puppeteer.use(StealthPlugin());
let browserInstance = null;
let pageInstance = null;

exports.startLogin = async (req, res) => {
  try {
    const email = process.env.AIRTABLE_EMAIL;
    const password = process.env.AIRTABLE_PASSWORD;

    browserInstance = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    pageInstance = await browserInstance.newPage();

    await pageInstance.goto('https://airtable.com/login', { waitUntil: 'networkidle0' });

    await pageInstance.type('#emailLogin', email);
    await pageInstance.click('button[type="submit"]');

    await pageInstance.waitForSelector('#passwordLogin', { timeout: 15000 });
    await pageInstance.type('#passwordLogin', password);

    await pageInstance.evaluate(() => {
      const passwordField = document.querySelector('#passwordLogin');
      const inputEvent = new Event('input', { bubbles: true });
      passwordField?.dispatchEvent(inputEvent);
    });

    await pageInstance.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 10000 });

    await pageInstance.click('button[type="submit"]');

    try {
      await pageInstance.waitForSelector('input[name="code"]', { timeout: 10000 });
      return res.json({ status: 'MFA_REQUIRED' });
    } catch {
      return res.json({ status: 'READY_TO_SCRAPE' }); // no MFA
    }
  } catch (err) {
    console.error('[Login Error]', err.message);
    return res.status(500).json({ error: 'Login start failed', reason: err.message });
  }
};


exports.submitMfaCode = async (req, res) => {
  const { mfaCode } = req.body;

  if (!pageInstance) {
    return res.status(400).json({ error: 'No session found. Start login again.' });
  }

  try {
    await pageInstance.type('input[name="code"]', mfaCode);
    await pageInstance.evaluate(() => {
      const submitButton = [...document.querySelectorAll('div.pointer')]
        .find(el => el.textContent?.trim().toLowerCase() === 'submit');
      submitButton?.click();
    });

    await pageInstance.waitForFunction(() =>
      window.location.href.includes('/app') || document.title.includes('Airtable'),
      { timeout: 60000 }
    );
    return res.json({ status: 'MFA_VERIFIED' });
  } catch (err) {
    console.error('[MFA Error]', err.message);
    await browserInstance?.close();
    browserInstance = null;
    pageInstance = null;
    return res.status(500).json({ error: 'MFA failed', reason: err.message });
  }
};

exports.scrapeHardcodedTicket = async (req, res) => {
  try {
    if (!pageInstance) {
      return res.status(400).json({ error: 'Session expired. Please login again.' });
    }

    const ticketId = 'recmoivzdGw8pyCt5'; // Hardcoded
    const secretSocketId = 'socziSGrrxrTDf2Xb'; // Hardcoded (you should later capture it dynamically)

    const cookies = await pageInstance.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const result = await fetchRevisionHistory(ticketId, cookieHeader, secretSocketId);
    const parsedData = parseActivityHtmlList(result.data, ticketId);

    console.log('-------parsed data', parsedData)
    return res.json({
      status: 'SCRAPE_SUCCESS',
      ticketId,
      data: parsedData
    });

  } catch (err) {
    console.error('[Scrape Error]', err.message);
    return res.status(500).json({ error: 'Scraping failed', reason: err.message });
  }
};




