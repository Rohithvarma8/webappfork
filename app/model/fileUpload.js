const sequelize = require('./../../config/database');
const { DataTypes } = require('sequelize');

const fileUpload = sequelize.define('fileUpload', { 
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    content_type: DataTypes.STRING,
    content_length: DataTypes.INTEGER,
    etag: DataTypes.STRING
});

module.exports = fileUpload;
