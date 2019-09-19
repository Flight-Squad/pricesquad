import cheerio from 'cheerio'
import Nightmare from 'nightmare'
import { flightAggregator } from './shared/shared'

export async function kayakFlights() {
  const processStartTime = process.hrtime()
  const nightmare = new Nightmare()
  const url = "https://www.kayak.com/flights/BOS-BWI/2019-09-26?sort=bestflight_a"
  const sel = 'div[class*="card"]';

  const listContainer = await nightmare
    .header('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.75 Safari/537.36')
    .goto(url)
    .wait('.Flights-Results-BestFlights')
    .evaluate(() => document.querySelector('.best-flights-list-results').outerHTML)
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
    const trips = flightAggregator.makeTripsData(prices, stops, airlines, durations);
    const processEndTime = process.hrtime(processStartTime);
    console.log(`KayakFlights: ${processEndTime[0]}s ${processEndTime[1]}nanos`);

    return {
      time: processEndTime,
      data: trips,
    };
}
