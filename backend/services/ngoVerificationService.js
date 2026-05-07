const puppeteer = require('puppeteer');
const fs = require('fs');
const os = require('os');
const path = require('path');

const normalize = (value) => String(value || '').trim().toLowerCase();
const getRegistryUrl = () => (
    process.env.MOCK_REGISTRY_URL || `http://localhost:${process.env.PORT || 5000}/mock-registry/public/index.html`
);

const fieldsToCompare = ['ngoName', 'darpanId', 'state', 'district', 'sector', 'ngoType'];

const valuesMatch = (submitted, scraped) => (
    fieldsToCompare.every((field) => normalize(submitted[field]) === normalize(scraped[field]))
);

const findCachedChrome = () => {
    const chromeCacheDir = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
    if (!fs.existsSync(chromeCacheDir)) return null;

    const versions = fs.readdirSync(chromeCacheDir)
        .filter((entry) => entry.startsWith('linux-'))
        .sort()
        .reverse();

    for (const version of versions) {
        const executablePath = path.join(chromeCacheDir, version, 'chrome-linux64', 'chrome');
        if (fs.existsSync(executablePath)) {
            return executablePath;
        }
    }

    return null;
};

const getBrowserLaunchOptions = () => {
    const configuredExecutable = process.env.PUPPETEER_EXECUTABLE_PATH;
    const defaultExecutable = puppeteer.executablePath();
    const executablePath = [configuredExecutable, defaultExecutable, findCachedChrome()]
        .find((candidate) => candidate && fs.existsSync(candidate));

    return {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-crash-reporter',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process'
        ],
        ...(executablePath ? { executablePath } : {})
    };
};

const scrapeFirstResult = async (page) => {
    const resultCard = await page.$('[data-testid="ngo-result"]');
    if (!resultCard) return null;

    return resultCard.evaluate((card) => {
        const readField = (field) => (
            card.querySelector(`[data-field="${field}"] strong`)?.textContent?.trim() || ''
        );

        return {
            ngoName: readField('ngoName'),
            darpanId: readField('darpanId'),
            state: readField('state'),
            district: readField('district'),
            sector: readField('sector'),
            ngoType: readField('ngoType')
        };
    });
};

const verifyNGOWithMockRegistry = async (submittedDetails) => {
    let browser;
    const registryUrl = getRegistryUrl();

    try {
        browser = await puppeteer.launch(getBrowserLaunchOptions());

        const page = await browser.newPage();
        await page.goto(registryUrl, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#searchForm');
        await page.waitForFunction(() => window.registryReady === true);

        await page.type('#ngoName', submittedDetails.ngoName);
        await page.type('#darpanId', submittedDetails.darpanId);
        await page.click('#searchButton');
        await page.waitForFunction(() => (
            document.querySelectorAll('[data-testid="ngo-result"]').length > 0
            || Boolean(document.querySelector('[data-testid="no-results"]'))
        ));

        const matchedNGO = await scrapeFirstResult(page);
        const verified = Boolean(matchedNGO) && valuesMatch(submittedDetails, matchedNGO);

        return {
            verified,
            matchedNGO,
            source: registryUrl
        };
    } catch (error) {
        return {
            verified: false,
            matchedNGO: null,
            source: registryUrl,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

module.exports = {
    verifyNGOWithMockRegistry
};
