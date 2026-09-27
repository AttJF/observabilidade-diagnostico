import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger, requestContext } from './logger';

// ===== 5 / 9 =====
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  let requestId = req.get('X-Request-Id');
  if (!requestId || !/^[A-Za-z0-9._:-]{1,128}$/.test(requestId)) {
    requestId = randomUUID();
  }
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  let exercise = 0;
  const match = req.path.match(/^\/ex(7|8|9|10|11)(?:\/|$)/);
  if (match) {
    exercise = Number(match[1]);
  } else if (req.path.startsWith('/pedidos/')) {
    exercise = 4;
  } else if (req.path === '/crash') {
    exercise = 6;
  } else if (['/health', '/lento', '/erro'].includes(req.path) || req.path.startsWith('/usuarios/')) {
    exercise = 5;
  }
  req.exercise = exercise;
  const context = { requestId, exercise };
  const start = process.hrtime.bigint();

  requestContext.run(context, () => {
    logger.info('200', { phase: 'start', method: req.method, route: req.path });
    res.once('finish', () => {
      requestContext.run(context, () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        let route = req.path;
        if (req.route) {
          route = req.baseUrl + req.route.path;
        }
        logger.info(String(res.statusCode), {
          phase: 'finish',
          method: req.method,
          route,
          statusCode: res.statusCode,
          durationMs
        });
      });
    });
    next();
  });
}
