const express = require('express');
const sequelize = require('../config/database');
const healthCheckRoute = require('./route/healthCheckRoute');
const fileUploadRoute = require('./route/fileUploadRoute');
const logger = require('./utils/cloudwatchLogger');
const { logRequest, handleServerErrors} = require('./middleware/metricMiddleware');
const metrics = require('./utils/cloudwatchMetrics');

const initialize = (app) => {

  app.use(express.json());
  app.use(express.urlencoded({ extended : true }));

  app.use((req, res, next) => {
    logger.http(`Incoming request: ${req.method} ${req.url}`, {
      headers: req.headers,
      params: req.params,
      query: req.query,
    });
    next();
  });

    // check for database conn
    sequelize.authenticate()
    .then(() => logger.info('Database connected'))
    .catch((err) => {
      logger.error('Database connection failed:', err.message);
    });

  sequelize.sync({ alter: true })
    .then(() => logger.info('Database synchronized'))
    .catch((err) => logger.error('Database synchronization failed:', err.message));

  app.use(logRequest);

  app.use('/v1/file', fileUploadRoute);

  // Middleware to handle invalid JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      logger.error('Invalid JSON payload received');
      metrics.increment('api.error.400', 1, { 
        reason: 'invalid_json',
        method: req.method,
        path: req.path 
      });
      return res.status(400).send();
    }
    next();
  });

  // Reject payload for methods other than GET
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.headers['content-type'] === 'application/json') {
      if (Object.keys(req.body).length === 0) {
        req.body = {}; 
      }
    }
    next();
  });

  // Route
  app.use('/healthz', healthCheckRoute);

  app.use(handleServerErrors);

  app.use((req, res) => {
    logger.warn('Endpoint not found. Only /healthz and v1/file endpoints work.');
    metrics.increment('api.error.404', 1, { 
      method: req.method,
      path: req.path 
    });
    res.status(404).send(); // Send 404 status with no body
  });
};

module.exports = initialize;

