import cheerio from 'cheerio'
import Nightmare from 'nightmare'

export async function kayakFlights() {
  const processStartTime = process.hrtime()
  const nightmare = Nightmare()
  const url = "https://www.kayak.com/flights/BOS-BWI/2019-09-26?sort=bestflight_a"
  const sel = 'div[class*="card"]';

  const listContainer = await nightmare
    .header('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36')
    .goto(url)
    .wait('.Flights-Results-BestFlights')
    .evaluate(() => document.querySelector('.best-flights-list-results').outerHTML)
    .end();

    // console.log(listContainer);
    // return;

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



      // flightNumbers.push(scraper(this).text());

      // const flightNum = scraper(this).find('div[class*="air-operations-flight-numbers_select-detail"]').find('.actionable--text').text()
      // console.log(flightNum);
      // const numStops = scraper(this).find('div[class*="select-detail--flight-stops-badge"]').text()
      // console.log(numStops);
      // const duration = scraper(this).find('span[class*="flight-stops--duration-time"]').text()
      // console.log(duration);
      // const priceOptions = [];
      // scraper(this).find('.fare-button--value').each(function (i, elem) {
      //   priceOptions.push(scraper(this).find('span[class*="value-total"]').text())
      // })
      // priceOptions.sort((a,b) => {
      //   // sort in ascending price order - lowest price first
      //   return parseInt(a, 10) - parseInt(b, 10);
      // })
      // console.log(priceOptions);



    })
    console.log(airlines);
    console.log(durations);
    console.log(stops);
    console.log(prices);

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

kayakFlights()
