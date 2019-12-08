import { Router } from "express";
import StatusCodes from "./config/statusCodes";
import { db } from "config/firestore";
import axios from 'axios';
import { SearchProviders } from "data/models/flightSearch/providers";
import logger from "config/logger";

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
  }

  await db.doc(docPath).set(docData, { merge: true });

  const reqIsDone = docData.numTrips === docData.tripIds.length;
  if (reqIsDone) {
    // no `await` because no error/response checking is implemented rn
    axios.post(`${process.env.CHATSQUAD_API}/sendPrices`, { sessionId });
  }

  logger.info('Trip Request', { provider, tripId, sessionId, docPath, tripIsDone, reqIsDone });
  res.status(StatusCodes.Post.success).send();
});

export default requestsRouter;
