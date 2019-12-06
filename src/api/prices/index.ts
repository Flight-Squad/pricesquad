import StatusCodes from "api/config/statusCodes";
import { sendSQSMessage, enqueueBatch } from "config/aws-sqs";
import { db } from "config/firestore";
import logger from "config/logger";
import { SearchProviders } from "data/models/flightSearch/providers";
import { Router } from "express";
import { paramValidation } from "./paramValidation";
import { createTripRequests, createDbEntry } from "./batch/round-trip";

const priceRouter = Router();

/**
 * See IFlightSearchParams

 req.body:

  origin: string;
  dest: string;
  departDate: Date;
  returnDate?: Date;
  isRoundTrip: boolean;
  numStops: FlightStops;

 */
priceRouter.post("/prices", paramValidation, async (req, res) => {
  const processStartTime = process.hrtime();
  const { sessionId, ...params } = req.body;

  const requestId = await sendSQSMessage(params, sessionId);
  const endTime = process.hrtime(processStartTime);
  logger.info(`ProcessTime=${endTime[0]}.${endTime[1]}`);
  res
    .status(StatusCodes.Post.success)
    .send(JSON.stringify({ id: requestId, processTime: endTime }));
});

/**
 * Makes a batch request for a combination of parameters
 * origins are interchangable
 * destinations are interchangeable
 * date arrays are included for future flexibility
 * ! Returns id for firestore doc (with collection) -> collection/document`
 *
 * Number of requests: N(origins)*N(destinations)*N(departDates)*N(returnDates)
 *
 * IF both origin and dest are IATA, add batch for each date
 *

req.body:

  origins: Array<string>;
  destinations: Array<string>;
  departDates: Array<Date>;
  returnDates: Array<Date>;
  isRoundTrip: boolean;
  numStops: FlightStops;
 */
priceRouter.post('/prices/batch', async (req, res) => {
  const processStartTime = process.hrtime();
  const { sessionId, ...params } = req.body;

  // Create a req for each combination of parameters
  const tripRequests = await createTripRequests(params);
  const docPath = await createDbEntry(sessionId, tripRequests.length, req.body);

  // Use search providers defined in src/data/models/flightSearch/providers
  await enqueueBatch(tripRequests, sessionId, docPath, SearchProviders);

  const endTime = process.hrtime(processStartTime);
  logger.info('/prices/batch', {ProcessTime: `${endTime[0]}.${endTime[1]}`});

  res.status(StatusCodes.Post.success).send(JSON.stringify({ id: docPath }));
})

priceRouter.get("/prices/:sessionId/:reqId", async (req, res) => {
  const processStartTime = process.hrtime();
  const { sessionId, reqId } = req.params;

  const snapshot = await db
    .collection("trip_requests")
    .doc(`${sessionId}#${reqId}`)
    .get();
  const data = snapshot.data();

  // ensure all provider keys are in data object
  const dataKeys = Object.keys(data);
  const providerKeys = Object.keys(SearchProviders);
  const requestIsSatisfied = providerKeys.every(key => dataKeys.includes(key));

  const endTime = process.hrtime(processStartTime);
  logger.info(`GET prices`, { procTime: `${endTime[0]}.${endTime[1]}` });

  if (requestIsSatisfied) {
    res.status(StatusCodes.Get.success).send(JSON.stringify({ res: data }));
  } else {
    res.status(StatusCodes.Get.NoContent).send();
  }
});

export default priceRouter;
