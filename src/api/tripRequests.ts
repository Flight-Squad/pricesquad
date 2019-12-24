import { Router } from "express";
import StatusCodes from "./config/statusCodes";
import { db } from "config/firestore";
import axios from 'axios';
import { SearchProviders } from "data/models/flightSearch/providers";
import logger from "config/logger";
import { getBestPrices } from "./prices/getBestPrices";
import { Squads } from "config/flightsquad";

const requestsRouter = Router();

requestsRouter.post('/tripRequest', async (req, res) => {
  const { results, provider, tripId, sessionId, docPath } = req.body;

  const snapshot = await db.doc(docPath).get();
  const docData = snapshot.data();

  // Initialize trip if no other providers have been added
  docData[tripId] = docData[tripId] || {};
  docData[tripId][provider] = results;

  const dataKeys = Object.keys(docData[tripId]);
  const providerKeys = Object.keys(SearchProviders);
  const tripIsDone = providerKeys.every(key => dataKeys.includes(key));
  if (tripIsDone) {
    docData.tripIds.push(tripId);
    docData.query.endTime = new Date();
  }

  const tripDoc = db.doc(docPath);

  await tripDoc.set(docData, { merge: true });

  const reqIsDone = docData.numTrips === docData.tripIds.length;
  if (reqIsDone) {
    // no `await` because no error/response checking is implemented rn
    const bestTrips = await getBestPrices(docData);
    const ourPrice = calculateTemplatePrice(bestTrips[0].price);

    const {platform, id} =  docData.query.user;

    const paymentDetailsRes = await axios.post(`${Squads.Payment}/payment`, {
      user: {platform, id},
      amount: ourPrice,
      tripId: tripDoc.id,
    });
    const paymentDetails = paymentDetailsRes.data;
    const paymentUrl = `${Squads.Flightsquad}/checkout${makePaymentQueryParams(paymentDetails)}`

    axios.post(`${process.env.CHATSQUAD_API}/send/prices`, {
      isRoundTrip: docData.query.isRoundTrip,
      platform: docData.query.user.platform,
      userId: docData.query.user.id,
      trips: bestTrips,
      price: ourPrice,
      paymentUrl,
    });
  }

  logger.info('Trip Request', { provider, tripId, sessionId, docPath, tripIsDone, reqIsDone });
  res.status(StatusCodes.Post.success).send();
});

function calculateTemplatePrice(price: number) {
  if (price <= 300) return (price * 0.94).toFixed(2);
  if (price > 300 && price <= 500) return (price * 0.89).toFixed(2);

  // else
  return (price * 0.86).toFixed(2);
}

function makePaymentQueryParams(details) {
  const {id, customer} = details;
  let fName = '', lName = '', email = customer.email || '';
  if (customer.name) {
    const nameArray = customer.split(' ');
    fName = nameArray[0];
    lName = nameArray[nameArray.length - 1];
  }
  return `?id=${id}&fName=${encodeURI(fName)}&lName=${encodeURI(lName)}&email=${encodeURI(email)}`;
}

export default requestsRouter;
