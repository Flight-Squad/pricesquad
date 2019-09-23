import cheerio from 'cheerio'
import Nightmare from 'nightmare'
import { IFlightSearchParams, FlightStops, validateFlightSearchParams } from 'data/models/flightSearchParams';
import { formatDateAsKebab } from 'data/dateProcessor';
import { text } from 'body-parser';
import currencyFormatter from 'currency-formatter';

/**
 * params in an object with the following
 *
 */
export async function googleFlights(params: IFlightSearchParams) {
  validateFlightSearchParams(params)
  const processStartTime = process.hrtime()
  const nightmare = new Nightmare()
  const url = makeUrl(params);

  const listContainer = await nightmare
    .goto(url)
    .wait('ol')
    .evaluate(() => document.querySelector('.gws-flights__app-root').outerHTML)
    .end();

    const trips = [];
    const pricesContainer = [];
    const scraper = cheerio.load(listContainer);
    scraper('ol[class*="gws-flights-results__result-list"]').each(function (i, elem) {
      scraper(this).find('li').each(function (i, elem) {
        const trip: any = {};

        trip.times = scraper(this).find('.gws-flights-results__times-row').text().trim()
        trip.airline = scraper(this).find('.gws-flights-results__carriers').text().trim()
        trip.duration = scraper(this).find('.gws-flights-results__duration').text().trim()
        trip.stops = scraper(this).find('.gws-flights-results__stops').text().trim()
        trip.layover = scraper(this).find('.gws-flights-results__layover-time').text().trim()

        // results in something like
        // "$299         $299"
        let price = scraper(this).find('.gws-flights-results__price').text().trim()

        // naiive
        price = price.split(" ")[0].trim()
        // console.log(price);

        trip.price = currencyFormatter.unformat(price, { code: 'USD' })

        if (trip.price) {
          trips.push(trip);
        }
      })
    })
    trips.sort((a,b) => a.price - b.price)

    const processEndTime = process.hrtime(processStartTime);

    return {
      time: processEndTime,
      data: trips,
      url: url,
    };
}

function makeUrl(params: IFlightSearchParams) {
  const departDate = formatDateAsKebab(params.departDate);
  const returnDate = params.returnDate ? formatDateAsKebab(params.returnDate) : '';
  const roundTripQuery = makeRoundTripQuery(params.isRoundTrip, params.origin, params.dest, returnDate);
  const stopsQuery = makeStopsQuery(params.numStops);
  const oneWayQuery = makeOneWayQuery(params.isRoundTrip);
  const url = `https://www.google.com/flights?hl=en#flt=${params.origin}.${params.dest}.${departDate}${roundTripQuery};c:USD;e:1;${stopsQuery}sd:1;t:f${oneWayQuery}`;
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
  if (stops === FlightStops.OneStop) return 's:1*1;';
  return '';
}

function makeOneWayQuery(isRoundTrip) {
  if (!isRoundTrip) return ';tt:o';
  return '';
}

function idek() {
  // "sc:"&left(A1,1)
  // is this a bug because it won't be separated by semicolon if max 1 stop
}

// Keeping this for future testing

// const params = {
//   origin: 'BOS',
//   dest: 'SFO',
//   departDate: new Date('2019-10-01'),
//   isRoundTrip: false,
//   numStops: 0
// };

// googleFlights(params).then(res => console.log(res))

