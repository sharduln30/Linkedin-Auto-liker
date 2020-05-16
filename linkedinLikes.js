let fs = require("fs");
let puppeteer = require('puppeteer');

let cfile = process.argv[2];
let pageToLike = process.argv[3];
let numPosts = parseInt(process.argv[4]);

(async function () {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 30,
        
        args: ['--start-maximized', '--disable-notifications', '--incognito']
    });
    
    let contents = await fs.promises.readFile(cfile, 'utf-8');
    let obj = JSON.parse(contents);
    let user = obj.user;
    let pwd = obj.pwd;
    let post = obj.post;

    let pages = await browser.pages();
    let page = pages[0];
    page.goto('https://www.linkedin.com/', {
        waitUntil: 'networkidle2'
    });
    await page.waitForSelector('.nav__button-secondary', {
        visible: true
    });
    await page.click(".nav__button-secondary");
    
    await page.waitForSelector('button[type=submit]', {
        visible: true
    });
    
    await page.waitFor(1000);
    await page.type('#username', user);
    await page.type('#password', pwd);
    await page.click("button[type=submit]");
    await page.waitForSelector('.share-box__open', {
        visible: true
    });
    await page.click(".share-box__open");
    
    await page.type('.ql-editor', post);

    await page.waitFor(2000);
    await page.click(".share-box-v2__actions");
    await page.waitFor(2000);
    await page.type('.search-global-typeahead__input', pageToLike);

    await page.waitFor(2000);
    
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    let lItem = 
    await page.waitForSelector('li.inline-block.mr1', {
        visible: true
    });

    await page.click('li.inline-block.mr1');
    
    
    
    await page.waitForSelector('.occludable-update.ember-view'); 
    // await page.click('.react-button__trigger.artdeco-button');
    
    let idx = 0;
    do {
        let elements = await page.$$('.occludable-update.ember-view');
        console.log(elements.length + elements[0]);
        await serveElement(elements[idx]);
        idx++;
        await page.waitFor(1000);
        
        await page.waitForSelector('.occludable-update', {
            hidden: false
        });
    } while (idx < numPosts);
    browser.close();
    
})();

async function serveElement(el) {
    let toClick = await el.$('.react-button__trigger.artdeco-button');
    await toClick.click();
}    
