import { FlightStops } from "data/models/flightSearchParams";
import uuidv4 from 'uuid/v4';
import { Collections, db } from "config/firestore";

/**
 *  Returns array of trip requests to enqueue
 * @param params `Object` -- should model `IBatchTripReqParams`
 */
export async function createTripRequests(params) : Promise<Array<any>> {
  const { origins, destinations, departDates, returnDates, isRoundTrip, numStops } = params;

  // Batch requests for all combinations of trips
  const tripRequests = [];

  for (const origin of origins) {
    for (const dest of destinations) {
      for (const departDate of departDates) {
        // if it's a round trip, iterate over return dates too
        if (returnDates && isRoundTrip) {
          for (const returnDate of returnDates) {
            tripRequests.push({
              origin,
              dest,
              departDate,
              returnDate,
              isRoundTrip,
              numStops,
            });
          }
        } else {
          tripRequests.push({
            origin,
            dest,
            departDate,
            isRoundTrip,
            numStops,
          });
        }
      }
    }
  }

  return tripRequests;
}

interface IBatchTripReqParams {
  origins: Array<string>;
  destinations: Array<string>;
  departDates: Array<Date>;
  returnDates: Array<Date>;
  isRoundTrip: boolean;
  numStops: FlightStops;
}

export async function createDbEntry(sessionId: string, numTrips: number, origQuery: any) : Promise<string> {
  // ## Create Document path
  const reqId = await uuidv4();
  const docId = `${sessionId}#${reqId}`;
  const docPath = `${Collections.tripRequests}/${docId}`;

  const queryStartTime = new Date(); // date-string -> so we know how long it takes to process

  const initData = {
    numTrips,
    queryStartTime,
    tripIds: [],
    query: origQuery,
    // ...trips -> [tripId]: Object -> {  [provider]: searchResults  }
  }

  await db.doc(docPath).set(initData, { merge: true });
  return docPath;
}
