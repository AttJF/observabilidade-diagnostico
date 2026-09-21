import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    let route = req.path;
    if (req.route) {
      route = req.route.path;
    }
    logger.info('request', {
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs
    });
  });

  next();
}
