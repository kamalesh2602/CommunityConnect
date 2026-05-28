// Originial ngo darpan website : https://ngodarpan.gov.in/#/search-ngo

const puppeteer = require('puppeteer');

const normalize = (value) => String(value || '').trim().toLowerCase();

const getRegistryUrl = () => (
    process.env.MOCK_REGISTRY_URL ||
    `http://localhost:${process.env.PORT || 5000}/mock-registry/public/index.html`
);

const fieldsToCompare = [
    'ngoName',
    'darpanId',
    'state',
    'district',
    'sector',
    'ngoType'
];

const valuesMatch = (submitted, scraped) => (
    fieldsToCompare.every(
        (field) => normalize(submitted[field]) === normalize(scraped[field])
    )
);

const getBrowserLaunchOptions = () => {
    const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        '/opt/render/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome';

    console.log('Using Chrome:', executablePath);

    return {
        executablePath,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--single-process'
        ]
    };
};

const scrapeFirstResult = async (page) => {
    const resultCard = await page.$('[data-testid="ngo-result"]');

    if (!resultCard) {
        return null;
    }

    return resultCard.evaluate((card) => {
        const readField = (field) =>
            card.querySelector(`[data-field="${field}"] strong`)
                ?.textContent?.trim() || '';

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
        console.log('Registry URL:', registryUrl);
        console.log(
            'Chrome Path:',
            process.env.PUPPETEER_EXECUTABLE_PATH
        );

        browser = await puppeteer.launch(getBrowserLaunchOptions());

        console.log('Browser launched successfully');

        const page = await browser.newPage();

        await page.goto(registryUrl, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        console.log('Registry page loaded');

        await page.waitForSelector('#searchForm', {
            timeout: 30000
        });

        await page.waitForFunction(
            () => window.registryReady === true,
            { timeout: 30000 }
        );

        console.log('Registry ready');

        await page.type('#ngoName', submittedDetails.ngoName);

        await page.type('#darpanId', submittedDetails.darpanId);

        await page.click('#searchButton');

        console.log('Search button clicked');

        await page.waitForFunction(
            () =>
                document.querySelectorAll(
                    '[data-testid="ngo-result"]'
                ).length > 0 ||
                Boolean(
                    document.querySelector(
                        '[data-testid="no-results"]'
                    )
                ),
            { timeout: 30000 }
        );

        console.log('Search completed');

        const matchedNGO = await scrapeFirstResult(page);

        console.log(
            'Matched NGO:',
            JSON.stringify(matchedNGO, null, 2)
        );

        const verified =
            Boolean(matchedNGO) &&
            valuesMatch(submittedDetails, matchedNGO);

        return {
            verified,
            matchedNGO,
            source: registryUrl
        };
    } catch (error) {
        console.error('VERIFICATION ERROR:', error);

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