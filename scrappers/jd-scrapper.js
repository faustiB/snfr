const puppeteer = require('puppeteer-extra')

const hidden = require('puppeteer-extra-plugin-stealth')
const { executablePath } = require('puppeteer')

const URL = "https://www.jdsports.es/hombre/calzado-de-hombre/zapatillas/?max=204"

const baseURL = 'https://www.jdsports.es/'
const MAX = 5000
const MIN = 2000

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleCookiesJdSports(page) {
    await page.waitForSelector('.btn.btn-level1.accept-all-cookies')
    await page.click('.btn.btn-level1.accept-all-cookies')
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

    await handleCookiesJdSports(page)

    let shoes = {}
    for (let i = 0; i < 5; i++) {
        let data = await page.evaluate(async (MAX, MIN, i) => {

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
            let urls = Array.from(document.querySelectorAll('.itemTitle > a'), a => a.getAttribute("href"))
            let images = Array.from(document.querySelectorAll(".thumbnail.overlay-thumbnail img")).map(x => x.getAttribute("data-src")) 

            if (i === 0) {
                nextPage = Array.from(document.querySelectorAll(".pageLinks > a"), a => a.getAttribute("href"))[5]
            } else {
                nextPage = Array.from(document.querySelectorAll(".pageLinks > a"), a => a.getAttribute("href"))[6]
            }

            return { titles, prices, urls, images, nextPage }
        }, MAX, MIN, i)
        
        //Get all data to shoes object with ternary operator
        shoes.titles = shoes.titles ? shoes.titles.concat(data.titles) : data.titles
        shoes.prices = shoes.prices ? shoes.prices.concat(data.prices) : data.prices
        shoes.urls = shoes.urls ? shoes.urls.concat(data.urls) : data.urls
        shoes.images = shoes.images ? shoes.images.concat(data.images) : data.images

        await sleep(Math.random() * (MAX - MIN) + MIN)
        let urlToGo = baseURL + data.nextPage
        await page.goto(urlToGo, { waitUntil: 'networkidle0' })
    }
    console.log(shoes)
    await browser.close()
}

module.exports = {
    start
}
