const sequelize = require('../../config/database');
const healthCheck = require('../model/healthCheck');
const logger = require('./../utils/cloudwatchLogger');

const insertData = async() => {
  try{
    logger.info(`data entry process started`);
    await healthCheck.create();
    logger.info(`data entry is successfull to the healthChecks table`);
    return true;
  } catch (err) {
    logger.error('Service : database error during entry: ', err.message);
    return false;
  }
};

module.exports = { insertData };