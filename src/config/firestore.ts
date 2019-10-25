import admin from 'firebase-admin';
import path from 'path';
const fs = require('fs');

const creds = JSON.stringify({
  "type": process.env.FS_ACCOUNT_TYPE,
  "project_id": process.env.FS_PROJ_ID,
  "private_key_id": process.env.FS_PRIV_KEY_ID,
  "private_key": process.env.FS_PRIV_KEY,
  "client_email": process.env.FS_CLIENT_EMAIL,
  "client_id": process.env.FS_CLIENT_ID,
  "auth_uri": process.env.FS_AUTH_URI,
  "token_uri": process.env.FS_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FS_AUTH_CERT_URL,
  "client_x509_cert_url": process.env.FS_CLIENT_CERT_URL,
});

// write to a new file named 2pac.txt
fs.writeFileSync(path.resolve(__dirname, './serviceAccount.json'), creds);
console.log('Firestore Service Account saved!');

// process.env.FIREBASE_CONFIG = ;

const serviceAccount = require('./serviceAccount.json');


// const serviceAccount = require(path.resolve(__dirname, 'firestore.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();

async function initDb() {}
