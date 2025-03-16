const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config();

// const serviceAccount = {
//   type: "service_account",
//   project_id: process.env.FIREBASE_PROJECT_ID,
//   private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//   client_email: process.env.FIREBASE_CLIENT_EMAIL,
// };

const serviceAccount = require("../cert/cert_SP.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

module.exports = { db };
