import cheerio from 'cheerio'
import Nightmare from 'nightmare'
import { flightAggregator } from './shared'
import { IFlightSearchParams, FlightStops, validateFlightSearchParams } from 'data/models/flightSearchParams';
import { formatDateAsKebab } from 'data/dateProcessor';

/**
 * params in an object with the following
 *
 */
export async function googleFlights(params: IFlightSearchParams) {
  validateFlightSearchParams(params)
  const processStartTime = process.hrtime()
  const nightmare = new Nightmare()
  const url = makeUrl(params);
  // const sel = 'div[class*="card"]';

  const listContainer = await nightmare
    .goto(url)
    .wait('ol')
    .evaluate(() => document.querySelector('ol').innerHTML)
    .end();

    const prices = [];
    const scraper = cheerio.load(listContainer);
    scraper('span[class*="price"]').each(function (i, elem) {
      prices.push(scraper(this).text());
    })

    const stops = [];
    scraper('span[class*="gws-flights__ellipsize"]').each(function (i, elem) {
      stops.push(scraper(this).text());
    })

    const durations = [];
    scraper('span[class*="duration"]').each(function (i, elem) {
      durations.push(scraper(this).text());
    })

    const airlines = [];
    scraper('img[class*="airline-logo"]').each(function (i, elem) {
      airlines.push(scraper(this).attr('alt'));
    })

    const trips = flightAggregator.makeTripsData(prices, stops, airlines, durations);

    const processEndTime = process.hrtime(processStartTime);
    console.log(`GoogleFlights: ${processEndTime[0]}s ${processEndTime[1]}nanos`);

    return {
      time: processEndTime,
      data: trips,
    };
}

function makeUrl(params: IFlightSearchParams) {
  const departDate = formatDateAsKebab(params.departDate);
  const returnDate = params.returnDate ? formatDateAsKebab(params.returnDate) : '';
  const roundTripQuery = makeRoundTripQuery(params.isRoundTrip, params.origin, params.dest, returnDate);
  const stopsQuery = makeStopsQuery(params.numStops);
  const url = `https://www.google.com/flights?hl=en#flt=${params.origin}.${params.dest}.${departDate}${roundTripQuery};c:USD;e:1;${stopsQuery};sd:1;t:f`;
  return url;
}

/**
 *
 * @param isRoundTrip
 * @param origin
 * @param dest
 * @param returnDateStr
 */
function makeRoundTripQuery(isRoundTrip, origin, dest, returnDateStr) {
  // Translated from following GSheets Formula
  // if(F2="Round Trip","*"&C2&"."&B2&"."&D5&"-"&E5&"-"&F5,"")
  // F2 specifies round trip or one way
  // C2 is dest, B2 is origin, "&D5&"-"&E5&"-"&F5 is date string
  if (!isRoundTrip) return '';

  return `*${dest}.${origin}.${returnDateStr}`;
}

function makeStopsQuery(stops) {
  // Translated from following GSheets Formula
  // if(E2="Nonstop","",if(E2="Max 1 Stop","s:1*1",""))
  // what's ls:1w ?
  if (stops === FlightStops.OneStop) return 's:1*1';
  return '';
}

function makeOneWayQuery() {
  // TODO
}

function idek() {
  // "sc:"&left(A1,1)
  // is this a bug because it won't be separated by semicolon if max 1 stop
}

// googleFlights({

// }).then( res => console.log(res));
