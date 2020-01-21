// import { Router } from 'express';
// import { firebase, AirportLocDoc } from 'config/database';
// import StatusCodes from 'api/config/statusCodes';

// const airportRouter = Router();

// airportRouter.get('/:location', async (req, res) => {
//     const { location } = req.params;
//     const airports = await getAirports(location);
//     if (airports) {
//         res.status(StatusCodes.Get.success).send(JSON.stringify({ airports }));
//     } else {
//         res.status(StatusCodes.Get.NoContent).send(
//             JSON.stringify({
//                 message: `Couldn't find an airport mapping for ${location}.
//       See your environment's pricesquad for debug details.`,
//             }),
//         );
//     }
// });

// async function getAirports(location) {
//     const { id, sheetName } = AirportLocDoc;
//     const ref = firebase.ref(`${id}/${sheetName}`);
//     const snapshot = await ref.once('value');
//     const data = snapshot.val();

//     if (data && data[location]) {
//         // airports is a comma-separated string
//         // filter out empty elements
//         const airports = data[location].airports.split(',').filter(item => item);
//         return airports;
//     } else {
//         return [];
//     }
// }

// export default airportRouter;
