
const puppeteer = require('puppeteer-extra')

const hidden = require('puppeteer-extra-plugin-stealth')
const {executablePath} = require('puppeteer')

const URL = 'https://www.footlocker.es/es/category/hombre/zapatillas.html'
const baseURL = 'https://www.footlocker.es'
const MAX = 5000
const MIN = 2000

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
    puppeteer.use(hidden())
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHttpsErrors: true,
        args: [
            '--incognito',
        ],
        executablePath: executablePath()
    })
    const page = await browser.newPage()
    await page.goto(URL, { waitUntil: 'networkidle0' })

    const shoes = await page.evaluate(async () => {

        
        const titles = Array.from(document.querySelectorAll('.ProductName-primary')).map(x => x.textContent)
        var prices = Array.from(document.querySelectorAll('.ProductPrice,.ProductPrice-final')).map(x => x.textContent)
        const urls = Array.from(document.querySelectorAll('.ProductCard-link'), a => a.getAttribute("href"))

        prices = prices.filter(price => !(price.includes('Rebajas')))

        return { titles, prices, urls }

    })

    var allSizes = []
 
    for (let i = 0; i < shoes.urls.length; i++) {
        let urlToGo = baseURL + shoes.urls[i]
        await page.goto(urlToGo, { waitUntil: 'networkidle0' })

        var sizes = await page.evaluate(async () => {
            const sizes = Array.from(document.querySelectorAll('.Button.SizeSelector-button-newDesign.SizeSelectorNewDesign-button--regional:not(:disabled')).map(x => x.textContent)
            return sizes
        })
        
        allSizes.push(sizes)
        //Random wait for next url
        await sleep(Math.random() * (MAX - MIN) + MIN)
    }

    shoes['sizes'] = allSizes

    console.log('Titles length: ' + shoes.titles.length)
    console.log('Prices length: ' + shoes.prices.length)
    console.log('Urls length: ' + shoes.urls.length)

    console.log(shoes)
    await browser.close()
}

module.exports = {
    start
}
