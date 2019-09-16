export const flightAggregator = Object.freeze({
  makeTripsData: makeAggregatorTripsData,
})

export const airline = Object.freeze({
  makeTripsData: {},
})
/**
 * Returns Array of objects
 * @param {*} prices
 * @param {*} stops
 * @param {*} airlines
 * @param {*} durations
 */
function makeAggregatorTripsData(prices, stops, airlines, durations) {
  // Everything has same number of elements
  const dataIsConsistent = prices.length === stops.length && stops.length === durations.length && stops.length === airlines.length;
  const trips = [];
  if (dataIsConsistent) {
    for (let i = 0; i < stops.length; i ++) {
      trips.push({
        price: prices[i],
        stops: stops[i],
        airline: airlines[i],
        duration: durations[i],
      })
    }
  } else {
    // Warn and put it in a try catch and return what you can
    console.log('DATA NOT CONSISTENT');
  }
  return trips;
}
