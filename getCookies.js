// getCookies.js
import chromium from 'chrome-aws-lambda';

export async function getCookies() {
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
        await page.type('#email', 'your-email@example.com'); // Replace with your email
        await page.type('#password', 'your-password'); // Replace with your password
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

export default getCookies;
