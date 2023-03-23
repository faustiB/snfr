const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { executablePath } = require('puppeteer')


const URL = "https://www.jdsports.es/hombre/calzado-de-hombre/zapatillas/?max=204"

const baseURL = 'https://www.jdsports.es/'
const MAX = 8000
const MIN = 2500

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCookiesJdSports(page) {
    await page.waitForSelector('.btn.btn-level1.accept-all-cookies')
    await page.click('.btn.btn-level1.accept-all-cookies')
}

async function start() {
    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath(),
        args: [
            '--incognito',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    })
    console.log('JD Sports: Scrapper launched')
    const page = await browser.newPage()
    await page.goto(URL, { waitUntil: 'networkidle0' })


    await handleCookiesJdSports(page)
    console.log('JD Sports: Cookies handled')

    let shoes = {}

    console.log('JD Sports: Scraping...')
    // for (let i = 0; i < 5; i++) {
    for (let i = 0; i < 1; i++) {
        let data = await page.evaluate(async (MAX, MIN, baseURL, i) => {

            //Random Scroll
            await new Promise((resolve) => {
                var totalHeight = 0
                var distance = 850
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

            let titles = Array.from(document.querySelectorAll('.itemTitle')).map(x => x.textContent.trim())
            let prices = Array.from(document.querySelectorAll('.pri')).map(x => x.textContent.split("- ")[0])
            let urls = Array.from(document.querySelectorAll('.itemTitle > a'), a => a.getAttribute("href")).map(x => baseURL + x)
            let images = Array.from(document.querySelectorAll(".thumbnail.overlay-thumbnail img")).map(x => x.getAttribute("data-src"))

            if (i === 0) {
                nextPage = Array.from(document.querySelectorAll(".pageLinks > a"), a => a.getAttribute("href"))[5]
            } else {
                nextPage = Array.from(document.querySelectorAll(".pageLinks > a"), a => a.getAttribute("href"))[6]
            }

            return { titles, prices, urls, images, nextPage }
        }, MAX, MIN, baseURL, i)
        
        shoes.titles = shoes.titles ? shoes.titles.concat(data.titles) : data.titles
        shoes.prices = shoes.prices ? shoes.prices.concat(data.prices) : data.prices
        shoes.urls = shoes.urls ? shoes.urls.concat(data.urls) : data.urls
        shoes.images = shoes.images ? shoes.images.concat(data.images) : data.images

        await sleep(Math.random() * (MAX - MIN) + MIN)
        let urlToGo = baseURL + data.nextPage
        await page.goto(urlToGo, { waitUntil: 'networkidle0' })
    }
    //Code disabled because of the antibot blockage in jd sports website
    // let allSizes = []
    // for (let i = 0; i < shoes.urls.length; i++) {
    //     let url = baseURL + shoes.urls[i]
    //     await page.goto(url, { waitUntil: 'networkidle0' })
    //     await sleep(Math.random() * (MAX - MIN) + MIN)
    //     let attrs = await page.evaluate(async () => {
    //         return Array.from(document.querySelectorAll("#productSizeStock > button")).map(x => x.getAttribute("data-stock"))
    //     })
    //     let sizes = await page.evaluate(async () => {
    //         let sizesDirty  = Array.from(document.querySelectorAll("#productSizeStock > button")).map(x => x.textContent)
    //         sizesDirty = sizesDirty.map(x => x.replace(/\t/g, ' '))
    //         sizesDirty = sizesDirty.map(x => x.replace(/(\r\n|\n|\r)/gm, " "))
    //         sizesDirty = sizesDirty.map(x => x.split(' '))
    //         sizesClean = sizesDirty.map(x => x[5].concat(" "+x[6]).trim())

    //         return sizesClean
    //     })
    //     let sizesAvailable = []
    //     for (let i = 0; i < attrs.length; i++) {
    //         if (attrs[i] === "1") {
    //             sizesAvailable.push(sizes[i])
    //         }
    //     }
    //     allSizes.push(sizesAvailable)
    // }
    // shoes.sizes = allSizes
    await browser.close()
    console.log('JD Sports: Scraping finished')
    return shoes
}

module.exports = {
    start
}