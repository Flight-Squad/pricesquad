const AWS = require("aws-sdk");
import * as AwsConfig from "config/aws";
import logger from "./winston";
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
export async function sendSQSMessage(data) {
  const id = uuidv4();
  data.requestId = id;
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

  return id;
}
