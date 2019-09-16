import cheerio from 'cheerio'
import Nightmare from 'nightmare'

export async function southwestFlights() {
  const processStartTime = process.hrtime()
  const nightmare = new Nightmare()
  const url = "https://www.southwest.com/air/booking/select.html?adultPassengersCount=1&departureDate=2019-09-28&departureTimeOfDay=ALL_DAY&destinationAirportCode=SFO&fareType=USD&int=HOMEQBOMAIR&originationAirportCode=BOS&passengerType=ADULT&reset=true&returnDate=&returnTimeOfDay=ALL_DAY&seniorPassengersCount=0&tripType=oneway"
  const sel = 'div[class*="card"]';

  const listContainer = await nightmare
    .goto(url)
    .wait('.select-detail--indicators')
    .evaluate(() => document.querySelector('.air-booking-select-page').outerHTML)
    .end();

    const scraper = cheerio.load(listContainer);
    const prices = [], flightNumbers = [], stops = [], durations = [];

    scraper('li[class*="air-booking-select-detail"]').each(function (i, elem) {
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
}
