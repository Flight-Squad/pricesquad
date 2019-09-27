import cheerio from 'cheerio'
import Nightmare from 'nightmare'
import { IFlightSearchParams, FlightStops } from 'data/models/flightSearchParams'
import logger from 'config/winston'
import { formatDateAsKebab } from 'data/dateProcessor'

export async function kayakFlights(params: IFlightSearchParams) {
  const processStartTime = process.hrtime()
  const nightmare = new Nightmare()
  const roundTripQuery = makeRoundTripQuery(params);
  const stopsQuery = makeStopsQuery(params);
  const departDate = formatDateAsKebab(params.departDate);
  const url = `https://www.kayak.com/flights/${params.origin}-${params.dest}/${departDate}${roundTripQuery}?sort=price_a${stopsQuery}`
  const sel = 'div[class*="card"]';

  logger.info(url);

  const listContainer = await nightmare
    .header('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36')
    .goto(url)
    .wait('.Flights-Results-FlightResultsList')
    .evaluate(() => document.querySelector('.Flights-Results-FlightResultsList').outerHTML)
    .end();

    const scraper = cheerio.load(listContainer);
    const prices = [], flightNumbers = [], stops = [], durations = [], airlines = [];

    scraper('div[class*="Flights-Results-FlightResultItem"]').each(function (i, elem) {
      scraper(this).find('.resultInner').find('.section.times').find('.bottom').each(function (i, elem) {
        airlines.push(scraper(this).text())
      })

      scraper(this).find('.resultInner').find('.section.duration').find('.top').each(function (i, elem) {
        let duration = scraper(this).text().trim();
        // https://stackoverflow.com/questions/6640382/how-to-remove-backslash-escaping-from-a-javascript-var
        // This regex removes any escaped characters
        // This was added because Kayak included a newline '\n' preceding actual duration
        duration = duration.replace(/\\"/g, '');
        durations.push(duration);
      })

      scraper(this).find('.resultInner').find('.section.stops').find('.top').each(function (i, elem) {
        stops.push(scraper(this).text().trim())
      })

      prices.push(scraper(this).find('.above-button').find('.price.option-text').text().trim());

    })
    // console.log(airlines);
    // console.log(durations);
    // console.log(stops);
    // console.log(prices);
    const trips = makeAggregatorTripsData(prices, stops, airlines, durations);
    const processEndTime = process.hrtime(processStartTime);

    return {
      time: processEndTime,
      data: trips,
      url: url,
    };
}

function makeRoundTripQuery(params: IFlightSearchParams) {
  if (params.isRoundTrip) {
    return '/' + formatDateAsKebab(params.returnDate);
  }
  return '';
}

function makeStopsQuery(params: IFlightSearchParams) {
  switch(params.numStops) {
    case FlightStops.NonStop: return '&fs=stops=0';
    case FlightStops.OneStop: return '&fs=stops=-2';
    default: return '';
  }
}

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
    const lengthData = {
      prices: prices.length,
      stops: stops.length,
      airlines: airlines.length,
      durations: durations.length
    };
    const totalData = {
      prices,
      stops,
      airlines,
      durations,
    }
    logger.error(`Kayak data not consistent--${JSON.stringify(lengthData)}--${JSON.stringify(totalData)}`)
  }
  return trips;
}
