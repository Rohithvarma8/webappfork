const fileUpload = require("./../model/fileUpload");
const { v4: uuidv4 } = require("uuid");
const { s3Bucket,bucketName } = require("./../../config/awsS3");
const logger = require('./../utils/cloudwatchLogger')

const fileService = {
    // Upload a file to S3 and save metadata to database
    uploadFile: async (file) => {
        const fileID = uuidv4();

        logger.info(`Starting upload for file: ${file.originalname} with ID: ${fileID}`);

        const fileDetails = {
            Bucket: bucketName,
            Key: fileID,
            Body: file.buffer,
            ContentType: file.mimetype
        };
        
        try {
            const s3Response = await s3Bucket.upload(fileDetails).promise();
            logger.info(`File successfully uploaded to S3`);
            const savedFile = await fileUpload.create({
                file_name: file.originalname,
                id: fileID,
                url: s3Response.Location,
                content_type: file.mimetype,
                content_length: file.size,
                etag: s3Response.ETag
            });
            logger.info(`File metadata saved in database for file ID: ${fileID}`);
            return savedFile;
        } catch (error) {
            logger.error(`Error during file upload for file ID: ${fileID}: ${error.message}`, error);
            await s3Bucket.deleteObject({ Bucket: bucketName, Key: fileID }).promise().catch(console.error);
            throw error;
        }
    },

    // Get file metadata by ID
    getFileById: async (fileId) => {
        logger.info(`Retrieving metadata for file ID: ${fileId}`);
        const file = await fileUpload.findByPk(fileId);
        if (!file) {
            logger.warn(`File not found in database for ID: ${fileId}`);
        } else {
            logger.info(`File found for ID: ${fileId}`);
        }
        return file;
    },

    // Delete file from S3 and database
    deleteFile: async (fileId) => {
        logger.info(`Initiating deletion for file ID: ${fileId}`);
        const fileToRemove = await fileUpload.findByPk(fileId);
    
        if (!fileToRemove) {
          logger.warn(`Deletion aborted: No file found with ID: ${fileId}`);
          return { notFound: true };
        }
        
        try {
          await s3Bucket.deleteObject({ Bucket: bucketName, Key: fileToRemove.id }).promise();
          logger.info(`File with ID: ${fileId} deleted from S3.`);
        } catch (error) {
          logger.error(`Error deleting file from S3 for file ID: ${fileId}: ${error.message}`, error);
          throw error;
        }
    
        try {
          await fileToRemove.destroy();
          logger.info(`File metadata deleted from database for file ID: ${fileId}`);
        } catch (error) {
          logger.error(`Error deleting file metadata from database for file ID: ${fileId}: ${error.message}`, error);
          throw error;
        }
    
        return { success: true };
    },
    
    // List all files
    getAllFiles: async () => {
        const files = await fileUpload.findAll();
        return files;
    }
};

module.exports = fileService;

