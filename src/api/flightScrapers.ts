import { Router } from "express";
import { googleFlights } from "controllers/googleFlights";
import { kayakFlights } from "controllers/kayak";
import routes from "./config/routeDefinitions";
import StatusCodes from "./config/statusCodes";
import { southwestFlights } from "controllers/southwest";
import { skiplaggedFlights } from "controllers/skiplagged";

var router = Router();

router.post(routes.scrapers.googleFlights.baseRoute, async function(req, res) {
  const bestTrips = await googleFlights(req.body);
  // TODO log process time
  res.status(StatusCodes.Post.success).json(bestTrips);
});

router.post(routes.scrapers.kayak.baseRoute, async function (req, res) {
  const bestTrips = await kayakFlights(req.body);
  // TODO log process time
  res.status(StatusCodes.Post.success).json(bestTrips);
})

router.post(routes.scrapers.southwest.baseRoute, async function (req, res) {
  const bestTrips = await southwestFlights(req.body);
  // TODO log process time
  res.status(StatusCodes.Post.success).json(bestTrips);
})

router.post(routes.scrapers.skiplagged.baseRoute, async function (req, res) {
  const bestTrips = await skiplaggedFlights(req.body);
  // TODO log process time
  res.status(StatusCodes.Post.success).json(bestTrips);
})

export default router;
