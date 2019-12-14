import test from 'ava';
import { getBestPrices } from '../getBestPrices';

const dummyDocData = {
  trip1: {
    google: {
      data: [
        {
          airline: 'Jetblue',
          duration: '1h 39m',
          layover: '',
          price: 171,
          stops: 'Nonstop',
          times: "5:30 AM   –   7:09 AM",
        },
        {
          airline: 'Jetblue',
          duration: '1h 39m',
          layover: '',
          price: 171,
          stops: 'Nonstop',
          times: "11:30 AM   –   12:55 PM",
        },
        {
          airline: 'Jetblue',
          duration: '1h 39m',
          layover: '',
          price: 136,
          stops: 'Nonstop',
          times: "5:30 AM   –   7:09 AM",
        },
        {
          airline: 'Jetblue',
          duration: '1h 39m',
          layover: '',
          price: 271,
          stops: 'Nonstop',
          times: "5:30 AM   –   7:09 AM",
        },
        {
          airline: 'Jetblue',
          duration: '1h 39m',
          layover: '',
          price: 471,
          stops: 'Nonstop',
          times: "5:30 AM   –   7:09 AM",
        },
      ],
      time: [4, 621556114],
      url: 'https://www.google.com/flights?hl=en#flt=BOS.BWI.2019-12-20;c:USD;e:1;s:1*1;sd:1;t:f;tt:o',
    },
  },
  numTrips: 1,
  tripIds: ['trip1'],
  query: {
    isRoundTrip: false,
  },
}

test('get best prices one way', async t => {
  const trips = await getBestPrices(dummyDocData);
	t.is(Boolean(trips), true);
});
