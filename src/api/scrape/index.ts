import logger from "config/winston";
import { convertHrTimeToNanos } from "data/dateProcessor";
import {
  IFlightSearchParams,
  makeFlightSearchParams
} from "data/models/flightSearchParams";
import { Router } from "express";
import routes from "api/config/routeDefinitions";
import { googleFlights } from "./google/post";
import StatusCodes from "api/config/statusCodes";
import { kayakFlights } from "./kayak/post";
import { skiplaggedFlights } from "./skiplagged/post";
import { southwestFlights } from "./southwest/post";

const router = Router();

// Using POST because sensitive information will eventually be passed through this route
router.post(routes.scrapers.googleFlights.baseRoute, async function(req, res) {
  const params: IFlightSearchParams = makeFlightSearchParams(req.body);
  const searchResults = await googleFlights(params);

  logger.info(
    JSON.stringify({
      time: {
        appxSecs: searchResults.time[0], // seconds
        time: convertHrTimeToNanos(searchResults.time),
        units: "nanos"
      },
      url: searchResults.url
    })
  );

  res
    .status(StatusCodes.Post.success)
    .json({ data: searchResults.data, url: searchResults.url });
});

router.post(routes.scrapers.kayak.baseRoute, async function(req, res) {
  const params: IFlightSearchParams = makeFlightSearchParams(req.body);
  const searchResults = await kayakFlights(params);

  logger.info(
    JSON.stringify({
      time: {
        appxSecs: searchResults.time[0], // seconds
        time: convertHrTimeToNanos(searchResults.time),
        units: "nanos"
      },
      url: searchResults.url
    })
  );
  res
    .status(StatusCodes.Post.success)
    .json({ data: searchResults.data, url: searchResults.url });
});

router.post(routes.scrapers.southwest.baseRoute, async function (req, res) {
  const params: IFlightSearchParams = makeFlightSearchParams(req.body);
  const searchResults = await southwestFlights(params);
  logger.info(
    JSON.stringify({
      time: {
        appxSecs: searchResults.time[0], // seconds
        time: convertHrTimeToNanos(searchResults.time),
        units: "nanos"
      },
      url: searchResults.url
    })
  );
  res.status(StatusCodes.Post.success).json({ data: searchResults.data, url: searchResults.url });
})

router.post(routes.scrapers.skiplagged.baseRoute, async function(req, res) {
  const params: IFlightSearchParams = makeFlightSearchParams(req.body);
  const searchResults = await skiplaggedFlights(params);
  logger.info(
    JSON.stringify({
      time: {
        appxSecs: searchResults.time[0], // seconds
        time: convertHrTimeToNanos(searchResults.time),
        units: "nanos"
      },
      url: searchResults.url
    })
  );
  res
    .status(StatusCodes.Post.success)
    .json({ data: searchResults.data, url: searchResults.url });
});

export default router;
