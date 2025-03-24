const SDK = require("aws-sdk");
require('dotenv').config();

SDK.config.update({
    region: process.env.AWS_REGION
});

const s3Bucket = new SDK.S3();

const bucketName = process.env.AWS_S3_BUCKET_NAME

module.exports = { s3Bucket,bucketName }



