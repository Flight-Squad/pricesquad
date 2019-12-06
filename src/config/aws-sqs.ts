const AWS = require("aws-sdk");
import * as AwsConfig from "config/aws";
import logger from "./logger";
import { SearchProviders } from "data/models/flightSearch/providers";

AWS.config.update({ region: AwsConfig.Region });

// Create SQS service client
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const uuidv4 = require('uuid/v4'); // To generate request id's

/**
 * Returns id of request
 *
 * @param data Adds JSON-stringified message based on `data` to SQS queue
 */
export async function sendSQSMessage(data, sessionId, reqId?: string): Promise<string> {
  // We're adding uuid to the data payload to remain platform agnostic
  // This way, we're not dependent on any one cloud provider's API
  const requestId = reqId || uuidv4();
  const searchParams = data;
  const params = {
    Entries: [],
    QueueUrl: AwsConfig.QueueUrl,
  };

  Object.keys(SearchProviders).map(provider => {
    params.Entries.push({
      Id: uuidv4(),
      MessageBody: JSON.stringify({
        params: searchParams,
        provider: SearchProviders[provider],
        sessionId,
        requestId,
      }),
    });
  });

  await sqs.sendMessageBatch(params, (err, res) => {
    if (err) {
      logger.error(err);
    } else {
      if (res.Failed.length > 0) {
        // TODO implement retry mechanism
        logger.error(`Failed ${res.Failed.length} requests`);
      }
      logger.info(`Successfully added ${res.Successful.length} messages`);
    }
  });

  return requestId;
}

/**
 *
 * @param trips `Array` of trip request objects
 * @param sessionId `string` -- chat or interaction id
 * @param docPath `string` -- id of firestore document, eg `<collection>/<document>
 * @param searchProviders `Object` or `enum` -- providers to search/scrape from
 */
export async function enqueueBatch(trips: Array<any>, sessionId: string, docPath: string, searchProviders): Promise<void> {
  // const searchParams = data;
  const params = {
    Entries: [],
    QueueUrl: AwsConfig.QueueUrl,
  };

  for (const trip of trips) {
    const tripId = uuidv4();

    for (const provider of Object.keys(searchProviders)) {
      params.Entries.push({
        Id: uuidv4(),
        MessageBody: JSON.stringify({
          params: trip,
          provider: searchProviders[provider],
          sessionId,
          tripId,
          docPath,
        }),
      });
    }
  }

  await sqs.sendMessageBatch(params, (err, res) => {
    if (err) {
      logger.error(err);
    } else {
      if (res.Failed.length > 0) {
        // TODO implement retry mechanism
        logger.error(`Failed ${res.Failed.length} requests`);
      }
      logger.info(`Successfully added ${res.Successful.length} messages`);
    }
  });
}
