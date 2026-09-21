import winston from 'winston';

// 4
export const logger = winston.createLogger({
  level:'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});
