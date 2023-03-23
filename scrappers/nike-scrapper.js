const puppeteer = require('puppeteer')

const MAX = 5000
const MIN = 2000


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCookiesNike(page) {
    await page.waitForSelector('#gen-nav-commerce-header-v2 > div.pre-modal-window.is-active > div > div:nth-child(3) > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button')
    await page.click('#gen-nav-commerce-header-v2 > div.pre-modal-window.is-active > div > div:nth-child(3) > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button')
}

async function start() {
    const browser = await puppeteer.launch({
        ignoreHttpsErrors: true,
        headless: true,
        args: [
            '--incognito',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })
    console.log('Nike: Scrapper launched')
    const page = await browser.newPage()
    await page.goto('https://www.nike.com/es/w/zapatillas-y7ok', { waitUntil: 'networkidle0' })

    await handleCookiesNike(page)
    console.log('Nike: Cookies handled')

    console.log('Nike: Scraping...')
    const shoes = await page.evaluate(async () => {

        //Random Scroll
        // await new Promise((resolve) => {
        //       var totalHeight = 0
        //       var distance = 100
        //       var timer = setInterval(() => {
        //           var scrollHeight = document.body.scrollHeight;
        //           window.scrollBy(0, distance);
        //           totalHeight += distance;
  
        //           if (totalHeight >= scrollHeight - window.innerHeight) {
        //               clearInterval(timer)
        //               resolve()
        //           }
        //       }, Math.random() * (MAX - MIN) + MIN)
        //   })
  
        const titles = Array.from(document.querySelectorAll('.product-card__title')).map(x => x.textContent)
        const prices = Array.from(document.querySelectorAll('.is--current-price')).map(x => x.textContent)
        const urls = Array.from(document.querySelectorAll('.product-card__img-link-overlay'), a => a.getAttribute("href"))
        const images = Array.from(document.querySelectorAll('.product-card__hero-image')).map(x => x.getAttribute("src"))

        return {
            titles: titles,
            prices: prices,
            urls: urls,
            images: images
        }

    })
    
    // Code disabled because of the antibot blockage in nike website
    // var allSizes = []
    // for (const url of shoes.urls) {
    //     await page.goto(`${url}`);

    //     //handle requestes 
    //     await sleep(Math.random() * (MAX - MIN) + MIN)

    //     var sizes = await page.evaluate(async () => {
    //         return Array.from(document.querySelectorAll('input[name=skuAndSize]:not(:disabled) + label')).map(size => size.innerHTML)

    //     })
    //     if (sizes.length == 0) {
    //         sizes = await page.evaluate(async () => {
    //             return Array.from(document.querySelectorAll('.size-grid-dropdown:not(:disabled)')).map(size => size.innerHTML)
    //         })
    //     }
    //     allSizes.push(sizes)
    // }

    // shoes['sizes'] = allSizes
    await browser.close()
    console.log('Nike: Scraping finished')
    return shoes

}

module.exports = {
    start
}


