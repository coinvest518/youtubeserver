// getCookies.js
import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

async function getCookies() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto('https://www.youtube.com');

  // Log in to YouTube (adjust selectors as necessary)
  await page.type('#email', 'coinvest518@gmail.com');
  await page.type('#password', 'Promisedivon518@');
  await page.click('#login-button');

  // Wait for the page to load
  await page.waitForNavigation();

  // Get the cookies
  const cookies = await page.cookies();

  // Close the browser
  await browser.close();

  return cookies;
}

export default getCookies
