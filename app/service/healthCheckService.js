const sequelize = require('../../config/database');
const healthCheck = require('../model/healthCheck');

const insertData = async() => {
  try{
    await healthCheck.create();
    return true;
  } catch (err) {
    console.error('Service : database error during entry: ', err.message);
    return false;
  }
};

module.exports = { insertData };