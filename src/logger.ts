import { AsyncLocalStorage } from 'node:async_hooks';
import winston from 'winston';

// ===== 9 =====
export const requestContext = new AsyncLocalStorage<{ requestId: string; exercise: number }>();

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      exercise: number;
    }
  }
}

const withRequestId = winston.format(info => {
  const context = requestContext.getStore();
  if (context) {
    info.requestId = context.requestId;
    info.exercise = context.exercise;
  }
  return info;
});

// ===== 4 / 9 =====
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    withRequestId(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});
