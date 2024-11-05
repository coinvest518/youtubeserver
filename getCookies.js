const puppeteer = require('puppeteer');

async function getCookies() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.youtube.com');

  // Log in to YouTube
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

module.exports = getCookies;