const SDK = require("aws-sdk");
require('dotenv').config();
const logger = require('./../app/utils/cloudwatchLogger');

if (!process.env.AWS_REGION || !process.env.AWS_S3_BUCKET_NAME) {
    logger.error("Missing required environment variables for AWS S3 configuration.");
    process.exit(1);
}

SDK.config.update({
    region: process.env.AWS_REGION
});

const s3Bucket = new SDK.S3();

const bucketName = process.env.AWS_S3_BUCKET_NAME;

const monitoredS3 = {
    upload: (params) => {
        const start = Date.now();
        metrics.increment('s3.activity.attempt', 1, { activity: 'upload' });
        return s3Bucket.upload(params).promise()
            .then(data => {
                const duration = Date.now() - start;
                metrics.timing('s3.activity.time', duration, {
                    activity: 'upload',
                    status: 'success'
                });
                metrics.increment('s3.activity.success', 1, { activity: 'upload' });
                return data;
            })
            .catch(err => {
                const duration = Date.now() - start;
                metrics.timing('s3.activity.time', duration, {
                    activity: 'upload',
                    status: 'failed'
                });
                metrics.increment('s3.activity.failure', 1, { activity: 'upload' });
                throw err;
            });
    },
    deleteObject: (params) => {
        const start = Date.now();
        metrics.increment('s3.activity.attempt', 1, { activity: 'delete' });
        return s3Bucket.deleteObject(params).promise()
            .then(data => {
                const duration = Date.now() - start;
                metrics.timing('s3.activity.time', duration, {
                    activity: 'delete',
                    status: 'success'
                });
                metrics.increment('s3.activity.success', 1, { activity: 'delete' });
                return data;
            })
            .catch(err => {
                const duration = Date.now() - start;
                metrics.timing('s3.activity.time', duration, {
                    activity: 'delete',
                    status: 'failed'
                });
                metrics.increment('s3.activity.failure', 1, { activity: 'delete' });
                throw err;
            });
    }
};

module.exports = { 
    s3Bucket, 
    bucketName,
    monitoredS3 
};