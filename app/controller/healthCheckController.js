const healthCheckService = require('../service/healthCheckService');
const logger = require('./../utils/cloudwatchLogger');
const metrics = require('./../utils/cloudwatchMetrics')

const dbStart = Date.now();

const healthCheckStatus = async(req,res,err) => {
  // Increment total health check requests
  metrics.increment('healthcheck.request');

  // check for payload
  if (req.headers['content-length'] && parseInt(req.headers['content-length'], 10) > 0) {
    metrics.increment('healthcheck.invalid_request', 1, { reason: 'content-length' });
    res.setHeader('Cache-Control', 'no-cache');
    logger.warn('healthz endpoint will not accept any payload', { contentLength: req.headers['content-length'] });
    return res.status(400).send(); // Bad Request
  }

  // Check for queries
  if (Object.keys(req.query).length > 0) {
    metrics.increment('healthcheck.invalid_request', 1, { reason: 'query-params' });
    res.setHeader('Cache-Control', 'no-cache');
    logger.warn('healthz endpoint will not accept any queries', { queryParams: Object.keys(req.query) });
    return res.status(400).send(); // Bad Request
  }
  
  try {
    // check for data is inserted or not
    logger.info(`data entry initiated from controller`);
    const isEntered = await healthCheckService.insertData();

    if(isEntered){
      res.setHeader('Cache-Control', 'no-cache');
      logger.info(`successfully entered returning OK`);
      metrics.timing('db.healthcheck.time', Date.now() - dbStart);
      metrics.increment('healthcheck.success');
      return res.status(200).send();
    }

    res.setHeader('Cache-Control', 'no-cache');
    logger.error('controller: entry is not inserted in database');
    metrics.increment('healthcheck.failure');
    return res.status(503).send();

  } catch(err){
    res.setHeader('Cache-Control', 'no-cache');
    logger.error('controller: got an error while entering into database', err);
    metrics.increment('healthcheck.failure');
    return res.status(500).send();
  }
}

const handleOtherMethods = async(req,res) => {
  metrics.increment('api.method.not_allowed', 1, { method: req.method });
  res.setHeader('Cache-Control', 'no-cache');
  logger.warn('controller: Sorry! you can only use GET method for healthz endpoint', { 
    method: req.method,
    path: req.path 
  });
  return res.status(405).send();
}

module.exports = { handleOtherMethods, healthCheckStatus};