import { Router } from "express";
import StatusCodes from "./config/statusCodes";
import { db } from "config/firestore";

const requestsRouter = Router();

requestsRouter.post('/tripRequest', async (req, res) => {
  const docData = {
    [req.body.provider]: req.body.results,
  };

  await db.collection('trip_requests').doc(`${req.body.sessionId}#${req.body.requestId}`).set(docData, {merge: true});
  res.status(StatusCodes.Post.success).send();
});

export default requestsRouter;
