import puppeteer from "puppeteer-extra";
import {Browser, Page} from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {Mutex} from "async-mutex";

let browser: Browser;
const requestMutex = new Mutex();
let queue = 0;

puppeteer.use(StealthPlugin());

export async function makeRequest(url: string, wait?: number): Promise<string> {
    if (queue > 2) {
        throw new Error('Too many requests');
    }

    queue++;
    await requestMutex.acquire();

    if (!browser) {
        browser = await puppeteer.launch({pipe: true});
    }

    let page: Page = await browser.newPage();

    try {
        return retryCount(1, async () => {
            await page.goto(url);
            await page.waitForSelector('body');
            if (wait) {
                await sleep(wait);
            }
            return await page.content();
        }, async () => {
            await browser?.close();
            browser = await puppeteer.launch({pipe: true});
            page = await browser.newPage();
        });

    } finally {
        await page.close();
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
