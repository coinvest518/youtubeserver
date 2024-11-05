const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto('https://developer.chrome.com/');

    // Set screen size.
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box.
    await page.locator('.devsite-search-field').fill('automate beyond recorder');

    // Wait and click on first result.
    const resultLink = await page.locator('.devsite-result-item-link').first();
    await resultLink.click();

    // Locate the full title with a unique string.
    const fullTitleSelector = await page.locator('text=Customize and automate');
    const fullTitle = await fullTitleSelector.evaluate(el => el.textContent);

    // Print the full title.
    console.log('The title of this blog post is "%s".', fullTitle);

    await browser.close();
})();