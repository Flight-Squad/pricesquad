import { sendSQSMessage } from "config/aws-sqs";
import logger from "config/winston";
import { validatePriceRequestQueryParams } from "data/models/flightSearchParams";
import { Router } from "express";
import StatusCodes from "./config/statusCodes";

const priceRouter = Router();

const paramValidation = async function (req, res, next) {
  const processStartTime = process.hrtime();
  const params = req.body;
  let err: any = false; // falsy value
  await validatePriceRequestQueryParams(params)
  .catch(e => {
    logger.error(e.message);
    err = e;
    res.status(StatusCodes.Error.Client.BadRequest).send('Bad Request');
  });
  const endTime = process.hrtime(processStartTime);
  logger.info(`ValidationTime=${endTime[0]}.${endTime[1]}`);
  // req.validatedParams = params;
  if (!err) next();
}

priceRouter.post('/prices', paramValidation, async (req, res) => {
  const processStartTime = process.hrtime();
  const params = req.body;
  const requestId = await sendSQSMessage(params);
  const endTime = process.hrtime(processStartTime);
  logger.info(`ProcessTime=${endTime[0]}.${endTime[1]}`);
  res.status(StatusCodes.Post.success).send(JSON.stringify({id: requestId, processTime: endTime}));
});

priceRouter.get('/prices/:id', async (req, res) => {
  res.status(StatusCodes.Error.Server.NotImplemented).send(req.params.id);
});

export default priceRouter;
