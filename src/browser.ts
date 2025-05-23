import puppeteer from "puppeteer-extra";
import {Browser, Page} from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {Mutex} from "async-mutex";

let page: Page;
let browser: Browser;
const requestMutex = new Mutex();
let queue = 0;

async function initBrowser() {
    puppeteer.use(StealthPlugin());

    browser = await puppeteer.launch({pipe: true});
    page = await browser.newPage();
}

export async function makeRequest(url: string, wait?: number): Promise<string> {
    if (queue > 5) {
        throw new Error('Too many requests');
    }

    queue++;
    await requestMutex.acquire();

    if (!page) {
        await initBrowser();
    }

    try {
        return retryCount(3, async () => {
            await page.goto(url);
            await page.waitForSelector('body');
            if (wait) {
                await sleep(wait);
            }
            return await page.content();
        }, async () => {
            await browser?.close();
            await initBrowser();
        });

    } finally {
        queue--;
        requestMutex.release();
    }
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryCount(count: number, callback: () => Promise<string>, onFail: () => Promise<void>) {
    try {
        return await callback();
    } catch (error) {
        if (count > 0) {
            await onFail();
            return await retryCount(count - 1, callback, onFail);
        } else {
            throw error;
        }
    }
}
