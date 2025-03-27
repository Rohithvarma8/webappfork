const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const logger = require('./../app/utils/cloudwatchLogger');

dotenv.config();

if (!process.env.DB_NAME || !process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_HOST || !process.env.DB_PORT ) {
  logger.error("Missing required environment variables for database connection.");
  process.exit(1);
}

//Instansiating my ORM
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
