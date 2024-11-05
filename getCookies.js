import chromium from 'chrome-aws-lambda'; // Use chrome-aws-lambda

async function getCookies() {
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args],
    executablePath: await chromium.executablePath,
    headless: true, // Set to true for production environments
  });
  const page = await browser.newPage();
  await page.goto('https://www.youtube.com');

  // Log in to YouTube
  await page.type('#email', 'coinvest518@gmail.com'); // Replace with your email
  await page.type('#password', 'Promisedivon518@'); // Replace with your password
  await page.click('#login-button');

  // Wait for the page to load
  await page.waitForNavigation();

  // Get the cookies
  const cookies = await page.cookies();

  // Close the browser
  await browser.close();

  return cookies;
}

export default getCookies; // Or use module.exports if using CommonJS
