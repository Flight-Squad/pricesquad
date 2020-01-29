import express from 'express';
import cors from 'cors';

// import scraperRouter from './scrape';
import StatusCodes from './config/statusCodes';

import logger from 'config/logger';
import transactionsRouter from './transactions';

const app = express();

// ONLY FOR DEVELOPMENT
app.use(cors());

// For Production/Staging

// // From https://daveceddia.com/access-control-allow-origin-cors-errors-in-react-express/
// // Set up a whitelist and check against it:
// // List of internal apis that can/should access this server
// var whitelist = ['http://example1.com', 'http://example2.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// // Then pass them to cors:
// app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // extended flag enables nested objects

app.use('/transactions', transactionsRouter);

app.get('/', (req, res) => {
    res.status(StatusCodes.Get.success).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Listening on port ${port}`));
