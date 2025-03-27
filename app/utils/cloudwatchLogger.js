const winston = require("winston");
require("winston-cloudwatch");
const dotenv = require("dotenv");
dotenv.config();

// Extract environment variables directly; they should already be defined in your .env file
const { AWS_REGION, ENVIRONMENT } = process.env;

// Define custom colors for different log levels
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "rainbow",
});

// Create a colorized format for console logs
const colorizedOutput = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, ...extra }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(extra).length ? JSON.stringify(extra) : ""
    }`;
  })
);

// Define an array to hold our transports based on the environment
const logDestinations = [];

if (ENVIRONMENT === "local") {
  // For local development: log to the console and a local file
  logDestinations.push(
    new winston.transports.Console({ format: colorizedOutput }),
    new winston.transports.File({ filename: "logs/combined.log" })
  );
} else if (ENVIRONMENT === "production") {
  // For production: log to AWS CloudWatch
  logDestinations.push(
    new winston.transports.CloudWatch({
      logGroupName: "/aws/ec2/webappGroup",
      logStreamName: "webapp/syslog",
      awsRegion: AWS_REGION,
      jsonMessage: true,
    })
  );
}

// Create the logger with a JSON format for structured logging
const logger = winston.createLogger({
  level: "silly", // Capture all log levels
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: logDestinations,
});

module.exports = logger;
