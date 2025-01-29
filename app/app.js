const express = require('express');
const sequelize = require('../config/database');
const healthCheckRoute = require('./route/healthCheckRoute');

const initialize = (app) => {

  app.use(express.json());
  app.use(express.urlencoded({ extended : true }));


  // Middleware to handle invalid JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error('Invalid JSON payload received');
      return res.status(400).send();
    }
    next();
  });

  // Reject payload for methods other than GEt
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.headers['content-type'] === 'application/json') {
      if (Object.keys(req.body).length === 0) {
        req.body = {}; 
      }
    }
    next();
  });

  // check for database conn
  sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch((err) => {
      console.error('Database connection failed:', err.message);
    });

  sequelize.sync({ alter: true })
    .then(() => console.log('Database synchronized'))
    .catch((err) => console.error('Database synchronization failed:', err.message));

  // Route
  app.use('/healthz', healthCheckRoute);

  app.use((req, res) => {
    console.error('only healthz endpoint works');
    res.status(404).send(); // Send 404 status with no body
  });
};

module.exports = initialize;

