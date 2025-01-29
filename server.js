const express = require('express');
const dotenv = require('dotenv');
const initialize = require('./app/app');

dotenv.config();

const app = express();
const port = process.env.PORT;

initialize(app);

// Check if server is running on the port
app.listen(port, () => {
  console.log(`Healthz application is running on ${port}`);
});
