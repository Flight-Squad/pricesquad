import express from 'express';

// import scraperRouter from './scrape';
import StatusCodes from './config/statusCodes';

import logger from 'config/logger';
import transactionsRouter from './transactions';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // extended flag enables nested objects

app.use('/transactions', transactionsRouter);

app.get('/', (req, res) => {
    res.status(StatusCodes.Get.success).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Listening on port ${port}`));
