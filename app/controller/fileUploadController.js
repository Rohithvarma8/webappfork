const fileService = require("./../service/fileUploadService");
const logger = require("./../utils/cloudwatchLogger");
const metrics = require("./../utils/cloudwatchMetrics");

logger.info("File controller loaded.");

const fileController = {
  // Upload a new file
  uploadFile: async (req, res) => {
    const startTime = Date.now();
    metrics.increment('file.operation.attempt', 1, { operation: 'upload' });

    logger.info("Received file upload request.");
    if (!req.file) {
      metrics.increment('client.error', 1, { operation: 'upload', reason: 'missing_file' });
      logger.warn("No file provided in upload request.");
      return res.status(400).json({ error: "No file provided" });
    }

    try {
      const savedFile = await fileService.uploadFile(req.file);
      metrics.increment('file.operation.success', 1, { operation: 'upload' });
      metrics.timing('file.operation.time', Date.now() - startTime, { operation: 'upload', status: 'success' });
      
      logger.info(`File uploaded successfully with ID: ${savedFile.id}`);
      return res.status(201).json({
        file_name: savedFile.file_name,
        id: savedFile.id,
        url: savedFile.url,
        upload_date: savedFile.upload_date,
      });
    } catch (error) {
      metrics.increment('file.operation.failure', 1, { operation: 'upload' });
      metrics.timing('file.operation.time', Date.now() - startTime, { operation: 'upload', status: 'failure' });
      
      logger.error("File upload error:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // Get file by ID
  getFileById: async (req, res) => {
    const startTime = Date.now();
    metrics.increment('file.operation.attempt', 1, { operation: 'get' });

    logger.info(`Received request to get file by ID: ${req.params.id}`);
    try {
      if (req.is("multipart/form-data")) {
        metrics.increment('client.error', 1, { operation: 'get', reason: 'invalid_content_type' });
        logger.warn("Form-data (multipart/form-data) is not allowed in GET file request.");
        return res
          .status(400)
          .json({ error: "Form-data (multipart/form-data) is not allowed" });
      }

      if (req.query && Object.keys(req.query).length > 0) {
        metrics.increment('client.error', 1, { operation: 'get', reason: 'query_parameters' });
        logger.warn("Query parameters are not allowed in GET file request.");
        return res.status(400).json({ error: "Query parameters are not allowed" });
      }

      if (req.headers["content-length"] && parseInt(req.headers["content-length"], 10) > 0) {
        metrics.increment('client.error', 1, { operation: 'get', reason: 'content_length' });
        logger.warn("Unexpected payload in GET file request.");
        return res.status(400).send();
      }

      const profile_pic = await fileService.getFileById(req.params.id);
      if (!profile_pic) {
        metrics.increment('file.operation.not_found', 1, { operation: 'get' });
        logger.warn(`File not found for ID: ${req.params.id}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      metrics.increment('file.operation.success', 1, { operation: 'get' });
      metrics.timing('file.operation.time', Date.now() - startTime, { operation: 'get', status: 'success' });
      
      logger.info(`File retrieved successfully for ID: ${req.params.id}`);
      return res.status(200).json({
        file_name: profile_pic.file_name,
        id: profile_pic.id,
        url: profile_pic.url,
        upload_date: profile_pic.upload_date,
      });
    } catch (error) {
      metrics.increment('file.operation.failure', 1, { operation: 'get' });
      metrics.timing('file.operation.time', Date.now() - startTime, { operation: 'get', status: 'failure' });
      
      logger.error("Error fetching file:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // Delete file by ID
  deleteFile: async (req, res) => {
    const startTime = Date.now();
    metrics.increment('file.operation.attempt', 1, { operation: 'delete' });

    logger.info(`Received request to delete file with ID: ${req.params.id}`);
    try {
      if (req.is("multipart/form-data")) {
        metrics.increment('client.error', 1, { operation: 'delete', reason: 'invalid_content_type' });
        logger.warn("Form-data (multipart/form-data) is not allowed in DELETE file request.");
        return res
          .status(400)
          .json({ error: "Form-data (multipart/form-data) is not allowed" });
      }

      if (req.query && Object.keys(req.query).length > 0) {
        metrics.increment('client.error', 1, { operation: 'delete', reason: 'query_parameters' });
        logger.warn("Query parameters are not allowed in DELETE file request.");
        return res.status(400).json({ error: "Query parameters are not allowed" });
      }

      if (req.headers["content-length"] && parseInt(req.headers["content-length"], 10) > 0) {
        metrics.increment('client.error', 1, { operation: 'delete', reason: 'content_length' });
        logger.warn("Unexpected payload in DELETE file request.");
        return res.status(400).send();
      }

      const result = await fileService.deleteFile(req.params.id);
      if (result.notFound) {
        metrics.increment('file.operation.not_found', 1, { operation: 'delete' });
        logger.warn(`File not found for deletion: ${req.params.id}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      metrics.increment('file.operation.success', 1, { operation: 'delete' });
      metrics.timing('file.operation.time', Date.now() - startTime, { operation: 'delete', status: 'success' });
      
      logger.info(`File deleted successfully for ID: ${req.params.id}`);
      return res.status(204).end();
    } catch (error) {
      metrics.increment('file.operation.failure', 1, { operation: 'delete' });
      metrics.timing('file.operation.time', Date.now() - startTime, { operation: 'delete', status: 'failure' });
      
      logger.error("Error deleting file:", error);
      if (error.code === "NoSuchKey") {
        return res.status(404).json({ error: "File not found in storage" });
      }
      if (error.name === "UnauthorizedError" || error.code === "AccessDenied") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(500).json({ error: error.message });
    }
  },

  // Unallowed methods
  UnallowedMethods: (req, res) => {
    metrics.increment('api.method.not_allowed', 1, { method: req.method });
    logger.warn(`Method not allowed: ${req.method} on ${req.originalUrl}`);
    return res.status(405).json({ error: "Method Not Allowed" });
  },
};

module.exports = fileController;