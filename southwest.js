import cheerio from 'cheerio'
import Nightmare from 'nightmare'

export async function southwestFlights() {
  const processStartTime = process.hrtime()
  const nightmare = Nightmare()
  const url = "https://www.southwest.com/air/booking/select.html?adultPassengersCount=1&departureDate=2019-09-28&departureTimeOfDay=ALL_DAY&destinationAirportCode=SFO&fareType=USD&int=HOMEQBOMAIR&originationAirportCode=BOS&passengerType=ADULT&reset=true&returnDate=&returnTimeOfDay=ALL_DAY&seniorPassengersCount=0&tripType=oneway"
  const sel = 'div[class*="card"]';

  const listContainer = await nightmare
    .goto(url)
    .wait('.select-detail--indicators')
    .evaluate(() => document.querySelector('.air-booking-select-page').outerHTML)
    .end();

    // console.log(listContainer);

    const scraper = cheerio.load(listContainer);
    const prices = [], flightNumbers = [], stops = [], durations = [];

    scraper('li[class*="air-booking-select-detail"]').each(function (i, elem) {
      // flightNumbers.push(scraper(this).text());
      // console.log(scraper(this).text());
      const flightNum = scraper(this).find('div[class*="air-operations-flight-numbers_select-detail"]').find('.actionable--text').text()
      console.log(flightNum);
      const numStops = scraper(this).find('div[class*="select-detail--flight-stops-badge"]').text()
      console.log(numStops);
      const duration = scraper(this).find('span[class*="flight-stops--duration-time"]').text()
      console.log(duration);
      const priceOptions = [];
      scraper(this).find('.fare-button--value').each(function (i, elem) {
        priceOptions.push(scraper(this).find('span[class*="value-total"]').text())
      })
      priceOptions.sort((a,b) => {
        // sort in ascending price order - lowest price first
        return parseInt(a, 10) - parseInt(b, 10);
      })
      console.log(priceOptions);



    })
    // scraper('span[class*="air-operations-flight-numbers_select-detail"]').find('.actionable--text').each(function (i, elem) {
    //   flightNumbers.push(scraper(this).text());
    // })

    // scraper('span[class*="select-detail--flight-stops-badge"]').each(function (i, elem) {
    //   stops.push(scraper(this).text());
    // })
    // scraper('span[class*="flight-stops--duration-time"]').each(function (i, elem) {
    //   durations.push(scraper(this).text());
    // })
    // scraper('img[class*="currency"]').each(function (i, elem) {
    //   prices.push(scraper(this).attr('alt'));
    // })

    // // Everything has same number of elements
    // const dataIsConsistent = flightNumbers.length === stops.length && stops.length === durations.length && stops.length === airlines.length;
    // const trips = [];
    // if (dataIsConsistent) {
    //   for (let i = 0; i < stops.length; i ++) {
    //     trips.push({
    //       price: flightNumbers[i],
    //       stops: stops[i],
    //       airline: airlines[i],
    //       duration: durations[i],
    //     })
    //   }
    // } else {
    //   // Warn and put it in a try catch and return what you can
    //   console.log('DATA NOT CONSISTENT');
    // }

    // const processEndTime = process.hrtime(processStartTime);
    // console.log(`GoogleFlights: ${processEndTime[0]}s ${processEndTime[1]}nanos`);

    // return {
    //   time: processEndTime,
    //   data: trips,
    // };

    // Keeping this for future demos

    // console.log('====================================');
    // console.log(flightNumbers);
    // console.log(stops);
    // console.log(durations);
    // console.log(airlines);
    // console.log(flightNumbers.length === stops.length && stops.length === durations.length && stops.length === airlines.length);


    // console.log('====================================');

    // console.log('====================================');
    // console.log(listContainer);
    // console.log('====================================');
}

southwestFlights()
