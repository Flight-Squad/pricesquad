import cheerio from 'cheerio'
import Nightmare from 'nightmare'
import { IFlightSearchParams } from 'data/models/flightSearchParams'
import { formatDateAsKebab } from 'data/dateProcessor'
import logger from 'config/winston';
const querystring = require('querystring');

export async function southwestFlights(params: IFlightSearchParams) {
  const processStartTime = process.hrtime()
  const nightmare = new Nightmare()
  // const url = "https://www.southwest.com/air/booking/select.html?adultPassengersCount=1&departureDate=2019-09-28&departureTimeOfDay=ALL_DAY&destinationAirportCode=SFO&fareType=USD&int=HOMEQBOMAIR&originationAirportCode=BOS&passengerType=ADULT&reset=true&returnDate=&returnTimeOfDay=ALL_DAY&seniorPassengersCount=0&tripType=oneway"
  const url = makeUrl(params);

  logger.debug(url);

  const listContainer = await nightmare
    .goto(url)
    .wait('.select-detail--indicators')
    .evaluate(() => document.querySelector('.air-booking-select-page').outerHTML)
    .end();

    const scraper = cheerio.load(listContainer);
    const trips = [];

    scraper('li[class*="air-booking-select-detail"]').each(function (i, elem) {
      const flightNum = scraper(this).find('div[class*="air-operations-flight-numbers_select-detail"]').find('.actionable--text').text()
      const numStops = scraper(this).find('div[class*="select-detail--flight-stops-badge"]').text()
      const duration = scraper(this).find('span[class*="flight-stops--duration-time"]').text()
      const priceOptions = [];
      scraper(this).find('.fare-button--value').each(function (i, elem) {
        // should find 3 prices - one for each tier southwest offers
        priceOptions.push(scraper(this).find('span[class*="value-total"]').text())
      })
      priceOptions.sort((a,b) => {
        // sort in ascending price order - lowest price first
        return parseInt(a, 10) - parseInt(b, 10);
      })
      const trip = {
        flightNum,
        numStops,
        duration,
        price: {
          wannaGetAway: priceOptions[0], // cheapest price will be
          anytime: priceOptions[1] || 0,
          businessSelect: priceOptions[2] || 0,
        }
      };
      trips.push(trip);
    });

    const processEndTime = process.hrtime(processStartTime);

    return {
      time: processEndTime,
      data: trips,
      url: url,
    };
}

/*

=if(B13=true,
  "https://www.southwest.com/air/booking/select.html?
  adultPassengersCount=1
  &departureDate="&A5&"-"&B5&"-"&C5&"
  &departureTimeOfDay=ALL_DAY
  &destinationAirportCode="&C2&"
  &fareType=USD
  &originationAirportCode="&B2&"
  &passengerType=ADULT
  &reset=true
  &returnDate="&if(F2="Round Trip",
    D5&"-"&E5&"-"&F5&"
    &returnTimeOfDay=ALL_DAY
    &seniorPassengersCount=0
    &tripType=roundtrip",

  "&returnTimeOfDay=ALL_DAY
  &seniorPassengersCount=0
  &tripType=oneway"
  )

,"")

*/

function makeUrl(params: IFlightSearchParams) {
  let url = 'https://www.southwest.com/air/booking/select.html?';

  const urlParamData: any = {
    adultPassengersCount: 1,
    departureDate: formatDateAsKebab(params.departDate),
    departureTimeOfDay: 'ALL_DAY',
    destinationAirportCode: params.dest,
    fareType: 'USD',
    originationAirportCode: params.origin,
    passengerType: 'ADULT',
    reset: true, // FIXME Might have to change this to a string
    seniorPassengersCount: 0,
    tripType: params.isRoundTrip ? 'roundtrip' : 'oneway',
    returnDate: params.isRoundTrip ? formatDateAsKebab(params.returnDate) : '',
    returnTimeOfDay: 'ALL_DAY',
  }

  const urlParams = querystring.encode(urlParamData);
  url += urlParams;

  return url;
}
