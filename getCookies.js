import puppeteer from 'puppeteer';

async function launchBrowser() {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless', '--disable-gpu'],
        });
        const page = await browser.newPage();
        await page.goto('https://accounts.google.com/signin/v2/identifier?service=youtube');

        // Enter email
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'coinvest518@gmail.com');
        await page.click('#identifierNext');

        // Enter password
        await page.waitForSelector('input[type="password"]', { visible: true });
        await page.type('input[type="password"]', 'Promiedivon518@');
        await page.click('#passwordNext');

        // Wait for navigation to complete
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        // Go to YouTube homepage
        await page.goto('https://www.youtube.com');

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

export default launchBrowser;