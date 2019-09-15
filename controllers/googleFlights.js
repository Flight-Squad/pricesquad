import cheerio from 'cheerio'
import Nightmare from 'nightmare'

export async function googleFlights() {
  const processStartTime = process.hrtime()
  const nightmare = Nightmare()
  const url = "https://www.google.com/flights?hl=en#flt=/m/01cx_.r/m/059rby.2019-09-29*r/m/059rby./m/01cx_.2019-10-03;c:USD;e:1;ls:1w;sd:1;t:e"
  const sel = 'div[class*="card"]';

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

    const processEndTime = process.hrtime(processStartTime);
    console.log(`GoogleFlights: ${processEndTime[0]}s ${processEndTime[1]}nanos`);

    return {
      time: processEndTime,
      data: trips,
    };

    // Keeping this for future demos

    // console.log('====================================');
    // console.log(prices);
    // console.log(stops);
    // console.log(durations);
    // console.log(airlines);
    // console.log(prices.length === stops.length && stops.length === durations.length && stops.length === airlines.length);


    // console.log('====================================');

    // console.log('====================================');
    // console.log(listContainer);
    // console.log('====================================');
}
