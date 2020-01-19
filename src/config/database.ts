import { Database, AirportLocMap } from '@flight-squad/admin';
import path from 'path';

Database.init({
    serviceAccount: process.env.FIRESTORE_CONFIG,
    firebaseUrl: process.env.FIREBASE_URL,
    serviceAccountPath: path.resolve(__dirname, './serviceAccount.json'),
});

export const DB = Database.firebase;

export const LocationIataMap = new AirportLocMap(process.env.AIRPORT_LOC_DOC, process.env.AIRPORT_LOC_SHEET_NAME, DB);
