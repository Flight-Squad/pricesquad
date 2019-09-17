import express from 'express';
import morgan from 'morgan'
import appRoot from 'app-root-path'
import winston from 'config/winston';
import flightScraperRouter from './flightScrapers';
import routes from './config/routeDefinitions';

var app = express();

// 'combined' is the standard Apache log format
app.use(morgan('combined', { stream: winston.stream }));

app.use(routes.scrapers.baseRoute, flightScraperRouter);


