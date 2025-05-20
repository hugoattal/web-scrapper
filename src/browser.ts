import puppeteer from "puppeteer-extra";
import {Page} from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

let page: Page;

async function initBrowser() {
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({});

    page = await browser.newPage();
}

export async function makeRequest(url: string, wait?:number): Promise<unknown> {
    if (!page) {
        await initBrowser();
    }

    await page.goto(url);
    await page.waitForSelector('body');
    if (wait) {
        await sleep(wait);
    }
    return await page.content();
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}