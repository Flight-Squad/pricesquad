import { sendSQSMessage } from "config/aws-sqs";
import logger from "config/logger";
import { validatePriceRequestQueryParams } from "data/models/flightSearchParams";
import { Router } from "express";
import StatusCodes from "./config/statusCodes";
import { db } from "config/firestore";
import { SearchProviders } from "data/models/flightSearch/providers";

const priceRouter = Router();

const paramValidation = async function (req, res, next) {
  const processStartTime = process.hrtime();
  const params = req.body;
  let err: any = false; // falsy value
  await validatePriceRequestQueryParams(params).catch(e => {
    logger.error(e.message);
    err = e;
    res.status(StatusCodes.Error.Client.BadRequest).send("Bad Request");
  });
  const endTime = process.hrtime(processStartTime);
  logger.info(`ValidationTime=${endTime[0]}.${endTime[1]}`);
  // req.validatedParams = params;
  if (!err) next();
};

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

priceRouter.get("/prices/:sessionId/:reqId", async (req, res) => {
  const processStartTime = process.hrtime();
  const {sessionId, reqId} = req.params;
  logger.info('Get Prices -- Doc ID', {sessionId, reqId});
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
  logger.info(`ProcessTime=${endTime[0]}.${endTime[1]}`);

  if (requestIsSatisfied) {
    res.status(StatusCodes.Get.success).send(JSON.stringify({ res: data }));
  } else {
    res.status(StatusCodes.Get.NoContent).send();
  }
});

export default priceRouter;
