const nikeScrapper = require('./scrappers/nike-scrapper')
const jdScrapper = require('./scrappers/jd-scrapper')

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

var admin = require("firebase-admin");
var serviceAccount = require("./firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()


app.get('/', async (req, res) => {
    let nikeShoes = await nikeScrapper.start()

     //remove entries that has GIFTCARD in value
    nikeShoes.urls.forEach(url => {
        if (url.includes("GIFTCARD")) {
            nikeShoes.urls.splice(nikeShoes.urls.indexOf(url), 1)
        }
    })

    //write all nike shoes in cloud firestore
    nikeShoes.titles.forEach(title => {
        db.collection('shoes').add({
            title: title,
            price: nikeShoes.prices[nikeShoes.titles.indexOf(title)],
            url: nikeShoes.urls[nikeShoes.titles.indexOf(title)],
            image: nikeShoes.images[nikeShoes.titles.indexOf(title)]
        })
    })

    let jdShoes = await jdScrapper.start()

    //write all jd shoes in cloud firestore
    jdShoes.titles.forEach(title => {
        db.collection('shoes').add({
            title: title,
            price: jdShoes.prices[jdShoes.titles.indexOf(title)],
            url: jdShoes.urls[jdShoes.titles.indexOf(title)],
            image: jdShoes.images[jdShoes.titles.indexOf(title)]
        })
    })

    console.log("Firebase: Adding scrapped shoes to collection shoes")

    res.json({
        "shoes scrapped": nikeShoes.titles.length + jdShoes.titles.length
    })
})


app.listen(port, () => {
    console.log(`SNFR Scrapper listening at http://localhost:${port}`)
})
