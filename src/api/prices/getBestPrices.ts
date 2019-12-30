import logger from "config/logger";

const compare = (a, b) => a.price - b.price;

/**
 * Returns a Promise with a list of trips sorted by price (Low to High)
 * @param data
 */
export async function getBestPrices(data) {
  const { tripIds } = data;
  const reqPrices = []; // best price from each trip => length is numTrips
  for (const tripId of tripIds) {
    const tripPrices = await getBestTripPrices(data[tripId]);
    // Add trip Id to trip
    Object.assign(tripPrices[0], { id: tripId });
    reqPrices.push(tripPrices[0]);
  }

  return reqPrices.sort(compare);
}

async function getBestTripPrices(trip) {
  const prices = []; // best price from each provider => length is numProviders
  const providerEntries = Object.entries(trip).filter(([key]) => key !== 'query');
  for (const [provider, value] of providerEntries) {
    // sort prices from each quote from the search provider
    logger.info('Trip', {data: JSON.stringify(trip[provider], null, 2)})
    const provPrices = trip[provider].data.sort(compare);
    prices.push(provPrices[0]);
  }
  return prices.sort(compare);
}
