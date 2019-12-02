import StatusCodes from "api/config/statusCodes";
import logger from "config/logger";
import { validatePriceRequestQueryParams } from "data/models/flightSearchParams";

export const paramValidation = async function (req, res, next) {
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