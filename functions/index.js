const functions = require("firebase-functions");
const jdScrapper = require("../scrappers/jd-scrapper");
// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//

const admin = require('firebase-admin')

admin.initializeApp()

exports.helloWorld = functions.https.onRequest(async (request, res) => {
  let shoes = await jdScrapper.start()
  for (let i = 0; i < shoes.titles.length; i++) {
    await admin.firestore().collection('shoes').add({
      title: shoes.titles[i],
      price: shoes.prices[i],
      url: shoes.urls[i],
      image: shoes.images[i],
      sizes: shoes.sizes[i]
    })
  }
  res.json(shoes);
});
// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await admin.firestore().collection('messages').add({original: original});
    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});
  });

//   // Listens for new messages added to /messages/:documentId/original and creates an
// // uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
.onCreate((snap, context) => {
  // Grab the current value of what was written to Firestore.
  const original = snap.data().original;

  // Access the parameter `{documentId}` with `context.params`
  functions.logger.log('Uppercasing', context.params.documentId, original);

  const uppercase = original.toUpperCase();

  functions.logger.log('Uppercased', uppercase);

  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to Firestore.
  // Setting an 'uppercase' field in Firestore document returns a Promise.
  return snap.ref.set({uppercase}, {merge: true});
});