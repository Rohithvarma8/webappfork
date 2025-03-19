const fileUpload = require("./../model/fileUpload");
const { v4: uuidv4 } = require("uuid");
const { s3Bucket,bucketName } = require("./../../config/awsS3");

const fileService = {
    // Upload a file to S3 and save metadata to database
    uploadFile: async (file) => {
        const fileID = uuidv4();
        const fileDetails = {
            Bucket: bucketName,
            Key: fileID,
            Body: file.buffer,
            ContentType: file.mimetype
        };
        
        try {
            const s3Response = await s3Bucket.upload(fileDetails).promise();

            const savedFile = await fileUpload.create({
                file_name: file.originalname,
                id: fileID,
                url: s3Response.Location,
                content_type: file.mimetype,
                content_length: file.size,
                etag: s3Response.ETag
            });
            
            return savedFile;
        } catch (error) {
            await s3Bucket.deleteObject({ Bucket: bucketName, Key: fileID }).promise().catch(console.error);
            throw error;
        }
    },

    // Get file metadata by ID
    getFileById: async (fileId) => {
        const file = await fileUpload.findByPk(fileId);
        return file;
    },

    // Delete file from S3 and database
    deleteFile: async (fileId) => {
        const fileToRemove = await fileUpload.findByPk(fileId);
        
        if (!fileToRemove) {
            return { notFound: true };
        }
        
        await s3Bucket.deleteObject({ Bucket: bucketName, Key: fileToRemove.id }).promise();
        await fileToRemove.destroy();
        
        return { success: true };
    },
    
    // List all files
    getAllFiles: async () => {
        const files = await fileUpload.findAll();
        return files;
    }
};

module.exports = fileService;

