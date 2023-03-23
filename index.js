const nikeScrapper = require('./scrappers/nike-scrapper')
const jdScrapper = require('./scrappers/jd-scrapper')

const express = require('express')
const app = express()
const port = 3000


app.get('/', async (req, res) => {
    let nikeShoes = await nikeScrapper.start()
    let jdShoes = await jdScrapper.start()

    console.log(nikeShoes)
    console.log("---------------------------------------")
    console.log("---------------------------------------")
    console.log("---------------------------------------")
    console.log(jdShoes)

    let shoes = {
        titles: nikeShoes.titles.concat(jdShoes.titles),
        prices: nikeShoes.prices.concat(jdShoes.prices),
        urls: nikeShoes.urls.concat(jdShoes.urls),
        images: nikeShoes.images.concat(jdShoes.images),
    }

    res.json(shoes)
})



// async function start() {

// // let jdShoes = await jd_scrapper.start()
// let nikeShoes = await nike_scrapper.start()

// // console.log(jdShoes)
// console.log(nikeShoes)

// }

app.listen(port, () => {
    console.log(`SNFR Scrapper listening at http://localhost:${port}`)
})
// admin.initializeApp(functions.config().firebase)