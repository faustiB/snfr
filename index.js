// const functions = require('firebase-functions')
// const admin = require('firebase-admin')

const nike_scrapper = require('./scrappers/nike-scrapper')
const jd_scrapper = require('./scrappers/jd-scrapper')

async function start() {


let jdShoes = await jd_scrapper.start()
// let nikeShoes = nike_scrapper.start()

console.log(jdShoes)
// console.log(nikeShoes)

}

start()

// admin.initializeApp(functions.config().firebase)