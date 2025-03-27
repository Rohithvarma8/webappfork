const StatsD = require('hot-shots');
const logger = require('./cloudwatchLogger')
const metrics = new StatsD({
    host: 'localhost',
    port: 8125,
    prefix: 'webapp.',
    errorHandler: (error) => {
        logger.error('Metrics error:', error);
        console.error('Metrics error:', error);
    }
});

module.exports = metrics;