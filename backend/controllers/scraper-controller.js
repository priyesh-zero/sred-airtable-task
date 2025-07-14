require("dotenv").config();
const {
  fetchRevisionHistory,
  parseActivityHtmlList,
} = require("../helpers/scraper");

const { firefox } = require("playwright");
const fs = require("fs");
const persistantMap = require("../helpers/persistant-map");
const Job = require("../models/job");
const RevisionSchema = require("../models/airtable/revision");
const { sleep } = require("../helpers/utils");

let browserInstance = null;
let page = null;

const email = process.env.AIRTABLE_EMAIL;
const password = process.env.AIRTABLE_PASSWORD;

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const randomDelay = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

exports.startLogin = async (req, res) => {
  const browserInstance = await firefox.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  const context = await browserInstance.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
    viewport: { width: 1366, height: 768 },
  });

  page = await context.newPage();

  try {
    await page.goto("https://airtable.com/login", {
      waitUntil: "load",
      timeout: 60000,
    });

    // ✨ Mimic human behavior
    await page.mouse.move(randomDelay(100, 400), randomDelay(100, 400));
    await page.mouse.click(randomDelay(200, 500), randomDelay(200, 500));
    await wait(randomDelay(500, 1000));

    // Fill email
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', email, { timeout: 5000 });
    await wait(randomDelay(500, 1000));
    await page.keyboard.press("Tab");

    // Click "Continue"
    await page.waitForSelector('button[type="submit"]:not([disabled])', {
      timeout: 10000,
    });
    await page.click('button[type="submit"]');

    // Wait and type password
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await page.type('input[name="password"]', password, {
      delay: randomDelay(50, 150),
    });
    await wait(randomDelay(500, 1000));
    await page.keyboard.press("Tab");

    // Final submit
    await page.waitForSelector('button[type="submit"]:not([disabled])', {
      timeout: 10000,
    });
    await wait(randomDelay(1000, 2000));
    await page.click('button[type="submit"]');

    try {
      await page.waitForSelector('input[name="code"]', { timeout: 10000 });
      return res.json({ status: "MFA_REQUIRED" });
    } catch {
      const cookies = await context.cookies();
      persistantMap.set(req.body.userId.toString(), cookies);
      await browserInstance?.close();
      browserInstance = null;
      pageInstance = null;
      return res.json({ status: "READY_TO_SCRAPE" }); // no MFA
    }
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await browser.close();
  }
};

exports.submitMfaCode = async (req, res) => {
  const { mfaCode } = req.body;

  if (!page) {
    return res
      .status(400)
      .json({ error: "No session found. Start login again." });
  }

  try {
    await page.type('input[name="code"]', mfaCode);
    await page.evaluate(() => {
      const submitButton = [...document.querySelectorAll("div.pointer")].find(
        (el) => el.textContent?.trim().toLowerCase() === "submit"
      );
      submitButton?.click();
    });

    await page.waitForFunction(
      () =>
        window.location.href.includes("/app") ||
        document.title.includes("Airtable"),
      { timeout: 60000 }
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

exports.scrapeTickets = async (req, res) => {
  try {
    if (!persistantMap.has(req.body.userId.toString())) {
      return res.json({ status: "LOGIN_REQUIRED" });
    }

    scrapeRevisions(req.body.userId.toString());

    res.json({ status: "Scraping..." });
  } catch (err) {
    console.error("[Scrape Error]", err.message);
    return res
      .status(500)
      .json({ error: "Scraping failed", reason: err.message });
  }
};

const scrapeRevisions = async (userId) => {
  try {
    const scrapingJobs = await Job.find({
      type: "sync-revisions",
      userId,
      status: {
        $nin: ["retry", "failed", "completed"],
      },
    });

    for (const job of scrapingJobs) {
      const cookies = await persistantMap.get(userId);

      const cookieHeader = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      const secretSocketId = "socziSGrrxrTDf2Xb"; // Hardcoded (you should later capture it dynamically)

      const result = await fetchRevisionHistory(
        job.data.baseId,
        job.data.ticketId,
        cookieHeader,
        secretSocketId
      );

      const parsedData = result.flatMap((data) =>
        parseActivityHtmlList(data, job.data.ticketId)
      );

      for (const data of parsedData) {
        await RevisionSchema.findOneAndUpdate(
          { uuid: data.uuid },
          {
            $addToSet: { _userIds: job.userId },
            $setOnInsert: {
              ...data,
            },
          },
          { upsert: true, new: true }
        );
      }

      await Job.findByIdAndUpdate(job._id, {
        status: "completed",
        completedAt: new Date(),
      });

      await sleep(1000);
    }
  } catch (e) {
    console.log("Running in error", e.message);
  }
};
