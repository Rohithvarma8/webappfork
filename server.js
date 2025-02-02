const express = require('express');
const dotenv = require('dotenv');
const initialize = require('./app/app');

dotenv.config();

const app = express();
const port = process.env.PORT;

initialize(app);

// Start the server and export it for Jest testing
const server = app.listen(port, () => {
  console.log(`Healthz application is running on ${port}`);
});

module.exports = server; // Export the server instance
