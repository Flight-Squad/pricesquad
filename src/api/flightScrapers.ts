import { Router } from "express";
import { googleFlights } from "controllers/googleFlights";
import { kayakFlights } from "controllers/kayak";
import routes from "./config/routeDefinitions";
import StatusCodes from "./config/statusCodes";
import { southwestFlights } from "controllers/southwest";
import { skiplaggedFlights } from "controllers/skiplagged";
import { IFlightSearchParams, makeFlightSearchParams } from "data/models/flightSearchParams";
import logger from "config/winston";
import { convertHrTimeToNanos } from "data/dateProcessor";

var router = Router();

router.post(routes.scrapers.googleFlights.baseRoute, async function(req, res) {
  const params: IFlightSearchParams = makeFlightSearchParams(req.body);
  const searchResults = await googleFlights(params);

  logger.info(JSON.stringify({
    time: {
      appxSecs: searchResults.time[0], // seconds
      time: convertHrTimeToNanos(searchResults.time),
      units: 'nanos',
    },
    url: searchResults.url,
  }))

  res.status(StatusCodes.Post.success).json(searchResults.data);
});

// TODO these need to be added in later

// router.post(routes.scrapers.kayak.baseRoute, async function (req, res) {
//   const searchResults = await kayakFlights(req.body);
//   // TODO log process time
//   res.status(StatusCodes.Post.success).json(searchResults);
// })

// router.post(routes.scrapers.southwest.baseRoute, async function (req, res) {
//   const searchResults = await southwestFlights(req.body);
//   // TODO log process time
//   res.status(StatusCodes.Post.success).json(searchResults);
// })

// router.post(routes.scrapers.skiplagged.baseRoute, async function (req, res) {
//   const searchResults = await skiplaggedFlights(req.body);
//   // TODO log process time
//   res.status(StatusCodes.Post.success).json(searchResults);
// })

export default router;
