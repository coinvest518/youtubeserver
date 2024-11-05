import chromium from 'chrome-aws-lambda';

async function launchBrowser() {
    let browser;
    try {
        browser = await chromium.puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath,
            headless: true,
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
        return cookies;
    } catch (error) {
        console.error('Error launching browser:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

launchBrowser();
