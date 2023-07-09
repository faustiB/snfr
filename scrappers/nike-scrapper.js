const puppeteer = require('puppeteer')

const MAX = 5748
const MIN = 2728

const URL = 'https://www.nike.com/es/w/zapatillas-y7okz'

//Function to wait random time
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Function to handle the cookies popup of nike page 
async function handleCookiesNike(page) {
    await page.waitForSelector('#gen-nav-commerce-header-v2 > div.pre-modal-window.is-active > div > div:nth-child(3) > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button')
    await page.click('#gen-nav-commerce-header-v2 > div.pre-modal-window.is-active > div > div:nth-child(3) > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button')
}

// function that starts the scrapper
async function start() {
    const browser = await puppeteer.launch({
        ignoreHttpsErrors: true,
        headless: false,
        windowSize: '1920,1080',
        args: [
            '--incognito',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })
    console.log('Nike: Scrapper launched')
    const page = await browser.newPage()
    await page.goto(URL, { waitUntil: 'networkidle0' })

    await handleCookiesNike(page)
    console.log('Nike: Cookies handled')

    console.log('Nike: Scraping...')
    const shoes = await page.evaluate(async (MAX, MIN) => {

        //Random Scroll
        await new Promise((resolve) => {
              var totalHeight = 0
              var distance = 950
              var timer = setInterval(() => {
                  var scrollHeight = document.body.scrollHeight;
                  window.scrollBy(0, distance);
                  totalHeight += distance;
                  if (totalHeight >= scrollHeight - window.innerHeight) {
                      clearInterval(timer)
                      resolve()
                  }
              }, Math.random() * (MAX - MIN) + MIN)
          })

        const titles = Array.from(document.querySelectorAll('.product-card__title')).filter(x => x.textContent != 'Tarjeta de regalo Nike').map(x => x.textContent)
        const prices = Array.from(document.querySelectorAll('.is--current-price')).map(x => x.textContent)
        const urls = Array.from(document.querySelectorAll('.product-card__img-link-overlay'), a => a.getAttribute("href"))
        const images = Array.from(document.querySelectorAll('.product-card__hero-image')).filter(x => x.getAttribute("alt") != 'Tarjeta de regalo Nike null').map(x => x.getAttribute("src"))

        return {
            titles: titles,
            prices: prices,
            urls: urls,
            images: images
        }

    }, MAX, MIN)
    
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


