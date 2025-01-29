const sequelize = require('./../../config/database');
const { DataTypes } = require('sequelize');


const healthCheck = sequelize.define('healthCheck'
  ,{
    // table contents
    check_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date_time: {
      type: DataTypes.DATE,
      defaultValue() {
        // Return the current UTC time in the desired format
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
      },
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = healthCheck;
