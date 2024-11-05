import chromium from 'chrome-aws-lambda';

async function launchBrowser() {
    let browser = null; // Initialize browser variable
    try {
        // Launch the browser
        browser = await chromium.puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath,
            headless: true, // Ensure this is true for production environments
        });

        const page = await browser.newPage();
        await page.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });

        // Log in to YouTube
        await page.click('button[aria-label="Sign in"]'); // Click the Sign in button

        // Wait for the login form to appear
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'coinvest518@gmail.com'); // Replace with your email
        await page.click('#identifierNext'); // Click the next button

        // Wait for password input to appear
        await page.waitForSelector('input[type="password"]');
        await page.type('input[type="password"]', 'Promisedivon518@'); // Replace with your password
        await page.click('#passwordNext'); // Click the next button

        // Wait for navigation to complete
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Get the cookies
        const cookies = await page.cookies();

        // Close the browser
        return cookies; // Return cookies for further processing
    } catch (error) {
        console.error('Error launching browser:', error);
    } finally {
        if (browser) {
            await browser.close(); // Ensure browser is closed in case of errors
        }
    }
}

launchBrowser();
