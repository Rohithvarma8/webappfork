const SDK = require("aws-sdk");
require('dotenv').config();

SDK.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SA_KEY,
    region: process.env.AWS_REGION
});

const s3Bucket = new SDK.S3();

const bucketName = process.env.AWS_S3_BUCKET_NAME

module.exports = { s3Bucket,bucketName }



