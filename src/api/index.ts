import express from 'express';
import morgan from 'morgan'
import appRoot from 'app-root-path'
import winston, { LoggerStream } from 'config/winston';
import scraperRouter from './scrape';
import routes from './config/routeDefinitions';
import StatusCodes from './config/statusCodes';

var app = express();

// 'combined' is the standard Apache log format
// https://stackoverflow.com/a/51918846
app.use(morgan('combined', { stream: new LoggerStream() }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // extended flag enables nested objects

app.use(routes.scrapers.baseRoute, scraperRouter);

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.status(StatusCodes.Get.success).send('Hi');
})
app.listen(port, () => winston.info(`Listening on port ${port}`))
