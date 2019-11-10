import express from 'express';
import appRoot from 'app-root-path'

// import scraperRouter from './scrape';
import routes from './config/routeDefinitions';
import StatusCodes from './config/statusCodes';
import priceRouter from './prices';
import requestsRouter from './requests';
import logger  from 'config/logger';

var app = express();

// 'combined' is the standard Apache log format
// https://stackoverflow.com/a/51918846


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // extended flag enables nested objects

app.use('/', priceRouter);
app.use('/', requestsRouter);

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.status(StatusCodes.Get.success).send('Hi');
})
app.listen(port, () => logger.info(`Listening on port ${port}`))
