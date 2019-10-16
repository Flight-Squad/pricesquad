import { Router } from "express";
import StatusCodes from "./config/statusCodes";
import { db } from "config/firestore";

const requestsRouter = Router();

requestsRouter.post('/tripRequest', (req, res) => {
  const docData = {
    [req.body.provider]: req.body.results,
  };

  db.collection('trip_requests').doc(req.body.requestId).set(docData, {merge: true});
});
