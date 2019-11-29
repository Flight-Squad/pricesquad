import { Router } from "express";
import StatusCodes from "./config/statusCodes";
import { db } from "config/firestore";
import axios from 'axios';

const requestsRouter = Router();

requestsRouter.post('/tripRequest', async (req, res) => {
  const docData = {
    [req.body.provider]: req.body.results,
  };

  const docId = `${req.body.sessionId}#${req.body.requestId}`;

  await db.collection('trip_requests').doc(docId).set(docData, {merge: true});
  if (await triggerShowPrices(docId)) {
    axios.post(`${process.env.CHATSQUAD_API}/sendPrices`, {
      sessionId: req.body.sessionId,
      requestId: req.body.requestId,
    });
  }
  res.status(StatusCodes.Post.success).send();
});

async function triggerShowPrices(docId) {
  // Check if all data is present
  return true;
}

export default requestsRouter;
