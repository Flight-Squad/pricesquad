import admin from 'firebase-admin';
import path from 'path';
import logger from './logger';
const fs = require('fs');

const creds = process.env.FS_CONFIG;

// write to a new file named 2pac.txt
fs.writeFileSync(path.resolve(__dirname, './serviceAccount.json'), creds);
logger.info('Firestore Service Account saved!');

// process.env.FIREBASE_CONFIG = ;

const serviceAccount = require('./serviceAccount.json');


// const serviceAccount = require(path.resolve(__dirname, 'firestore.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
export const firebase = admin.database();

export const Collections = {
  tripRequests: 'trip_requests',
};

export const AirportLocDoc = {
  id: process.env.AIRPORT_LOC_DOC,
  sheetName: process.env.SHEET_NAME,
};
