const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
require("dotenv").config();
const {
  fetchRevisionHistory,
  parseActivityHtmlList,
} = require("../helpers/scraper");

puppeteer.use(StealthPlugin());
const userBrowserInstance = new Map();
const userPageInstance = new Map();

const checkForUserBrowserInstance = (userId) => {
  if (userBrowserInstance.has(userId)) {
    return userBrowserInstance.get(userId);
  }
  return null;
};

const checkForUserPageInstance = (userId) => {
  if (userPageInstance.has(userId)) {
    return userPageInstance.get(userId);
  }
  return null;
};

const startLogin = async (userId) => {
  const email = process.env.AIRTABLE_EMAIL;
  const password = process.env.AIRTABLE_PASSWORD;

  const browserInstance = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  userBrowserInstance.set(userId, browserInstance);

  const pageInstance = await browserInstance.newPage();

  userPageInstance.set(userId, pageInstance);

  await pageInstance.setJavaScriptEnabled(true);
  await pageInstance.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  await pageInstance.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
  });

  await pageInstance.goto("https://airtable.com/login", {
    waitUntil: "networkidle0",
  });

  await pageInstance.type("#emailLogin", email);

  await Promise.all([
    pageInstance.waitForNavigation({ waitUntil: "networkidle0" }),
    pageInstance.click('button[type="submit"]'),
  ]);
  // await pageInstance.click('button[type="submit"]');

  await pageInstance.waitForSelector("#passwordLogin", { timeout: 300000 });
  await pageInstance.type("#passwordLogin", password);

  await pageInstance.evaluate(() => {
    const passwordField = document.querySelector("#passwordLogin");
    const inputEvent = new Event("input", { bubbles: true });
    passwordField?.dispatchEvent(inputEvent);
  });

  await pageInstance.waitForFunction(
    () => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    },
    { timeout: 10000 },
  );

  await pageInstance.click('button[type="submit"]');

  try {
    await pageInstance.waitForSelector('input[name="code"]', {
      timeout: 10000,
    });
    return null;
  } catch {
    return pageInstance;
  }
};

const submitMfaCode = async (req, res) => {
  const { mfaCode } = req.body;

  if (!pageInstance) {
    return res
      .status(400)
      .json({ error: "No session found. Start login again." });
  }

  try {
    await pageInstance.type('input[name="code"]', mfaCode);
    await pageInstance.evaluate(() => {
      const submitButton = [...document.querySelectorAll("div.pointer")].find(
        (el) => el.textContent?.trim().toLowerCase() === "submit",
      );
      submitButton?.click();
    });

    await pageInstance.waitForFunction(
      () =>
        window.location.href.includes("/app") ||
        document.title.includes("Airtable"),
      { timeout: 60000 },
    );
    return res.json({ status: "MFA_VERIFIED" });
  } catch (err) {
    console.error("[MFA Error]", err.message);
    await browserInstance?.close();
    browserInstance = null;
    pageInstance = null;
    return res.status(500).json({ error: "MFA failed", reason: err.message });
  }
};

const scrapeTicket = async (job) => {
  let pageInstance = checkForUserPageInstance(job.userId);
  if (!pageInstance) {
    pageInstance = await startLogin(job.userId);
  }

  const ticketId = job.data.ticketId;
  const baseId = job.data.baseId;
  const secretSocketId = "socziSGrrxrTDf2Xb"; // Hardcoded (you should later capture it dynamically)

  const cookies = await pageInstance.cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  const result = await fetchRevisionHistory(
    baseId,
    ticketId,
    cookieHeader,
    secretSocketId,
  );
  return parseActivityHtmlList(result.data, ticketId);
};

module.exports = {
  checkForUserBrowserInstance,
  checkForUserPageInstance,
  startLogin,
  submitMfaCode,
  scrapeTicket,
};
