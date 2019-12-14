import StatusCodes from "api/config/statusCodes";
import { sendSQSMessage, enqueueBatch } from "config/aws-sqs";
import { db } from "config/firestore";
import logger from "config/logger";
import { SearchProviders } from "data/models/flightSearch/providers";
import { Router } from "express";
import { paramValidation } from "./paramValidation";
import { createTripRequests, createDbEntry } from "./batch/round-trip";
import { getBestPrices } from "./getBestPrices";

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
priceRouter.post("/", paramValidation, async (req, res) => {
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
priceRouter.post('/batch', async (req, res) => {
  const processStartTime = process.hrtime();
  const { sessionId, ...params } = req.body;

  // Create a req for each combination of parameters
  const tripRequests = await createTripRequests(params);
  const docPath = await createDbEntry(sessionId, tripRequests.length, req.body);

  // Use search providers defined in src/data/models/flightSearch/providers
  await enqueueBatch(tripRequests, sessionId, docPath, SearchProviders);

  const endTime = process.hrtime(processStartTime);
  logger.info('/prices/batch', { ProcessTime: `${endTime[0]}.${endTime[1]}` });

  res.status(StatusCodes.Post.success).send(JSON.stringify({ id: docPath }));
})

priceRouter.get("/:collection/:doc", async (req, res) => {
  const processStartTime = process.hrtime();
  const { collection, doc } = req.params;

  const snapshot = await db.collection(collection).doc(doc).get();

  const data = snapshot.data();
  if (!data) res.status(StatusCodes.Get.NoContent).send();

  const reqPrices = await getBestPrices(data);

  const endTime = process.hrtime(processStartTime);
  logger.info(`GET prices`, { procTime: `${endTime[0]}.${endTime[1]}`, collection, doc });

  res.status(StatusCodes.Get.success).send(JSON.stringify({ res: reqPrices }));
});

export default priceRouter;
