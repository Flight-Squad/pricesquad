import axios from 'axios'
import cheerio from 'cheerio'
import Nightmare from 'nightmare'

async function scrap() {
  const nightmare = Nightmare()
  const url = "https://skiplagged.com/flights/NYC/SFO/2019-09-27/2019-10-20"

  // TODO Scroll to bottom of page
  // https://github.com/segmentio/nightmare/issues/625#issuecomment-217730846
  // very naive method - will infinite loop on a truly infinite scrolling page

  const listContainer = await nightmare
    .goto(url)
    .wait('.trip-duration')
    .evaluate(() => document.querySelector('.trip-list').innerHTML)
    .end();

  const scraper = cheerio.load(listContainer);
  const totalTrips = scraper('.trip').length;
  const tripsData = [];
  scraper('.trip').each(async function (i, elem) {
    const trip = {};

    // the text selector in this call returns all of the plain text
    // under the div we've selected, resulting in a string like "11h1 stop"
    let durationAndStops = scraper(this).find('.trip-duration').text();

    // This is a hacky workaround solution
    // the text selector in the previous call returns all of the plain text
    // under the div we've selected, resulting in a string like "11h1 stop"
    // This split calls splits the text into hours (first elem) and a string
    // indicating number of stops (second elem)
    durationAndStops = durationAndStops.split("h");
    trip.duration = durationAndStops[0];
    trip.stops = durationAndStops[1];

    const airlinesText = scraper(this).find('.airlines').data('original-title');
    const airlineNumbers = getAirlineNumbers(airlinesText);

    // Works!
    const price = scraper(this).find('.trip-cost').find('p').text();

    // TODO trip path


    console.log('====================================');
    console.log(airlineNumbers);
    console.log(price)
    console.log('====================================');

    // If everything is valid, return
    // If not, log error/missing components, move onto next element. Do NOT add to list of return objects
  })

  // const trips = [];
  // console.log('====================================');
  // console.log(scraper('.trip').length);
  // console.log('====================================');
}

function getAirlineNumbers(airlineData) {
  // bug here --> airline data undef
  if (!airlineData) return;

  const airlineNumbers = [];
  try {
    const airScraper = cheerio.load(airlineData);
    airScraper('span').each(function (i, elem) {
      airlineNumbers.push(airScraper(this).text());
    })
  } catch (err) {
    console.log('====================================');
    console.log(airlineData);
    console.log("ERROROROR");
    console.log('====================================');
  }
  return airlineNumbers;
}

scrap();
