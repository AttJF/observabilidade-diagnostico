import express, { type ErrorRequestHandler } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { logger, requestContext } from './logger';
import { processOrder } from './orders';
import { requestLogger } from './requestLogger';

// ===== 8 =====
export class AppError extends Error {
  constructor(public readonly statusCode: number, options?: ErrorOptions) {
    super('error', options);
    this.name = 'AppError';
  }
}

export const app = express();
app.use(requestLogger);

// ===== 5 =====
app.get('/health', (req, res) => res.json({ code: 200, exercise: req.exercise }));
app.get('/usuarios/:id', (req, res) => res.json({ code: 200, exercise: req.exercise }));
app.get('/lento', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  res.json({ code: 200, exercise: req.exercise });
});
app.get('/erro', (_req, _res) => {
  throw new Error('error');
});
// ===== 4 =====
app.get('/pedidos/:id', async (req, res) => {
  const total = await processOrder(req.params.id);
  logger.info('200', { total });
  res.json({ code: 200, exercise: req.exercise });
});
// ===== 6 =====
app.get('/crash', async (req, res) => {
  await new Promise<void>((_resolve, reject) => {
    setTimeout(() => reject(new Error('error')), 100);
  });
  res.json({ code: 200, exercise: req.exercise });
});

// ===== 7 =====
function reportAsyncError(error: unknown): void {
  console.error('error', requestContext.getStore(), error);
}

export async function readConfig(filePath: string): Promise<unknown> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const config: unknown = JSON.parse(content);
    logger.info('200', { phase: 'read' });
    return config;
  } catch (error: unknown) {
    reportAsyncError(error);
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new AppError(404, { cause: error });
    }
    throw error;
  }
}

export async function retryLater(): Promise<void> {
  try {
    await new Promise<void>((_resolve, reject) => {
      setTimeout(() => reject(new Error('error')), 200);
    });
  } catch (error: unknown) {
    reportAsyncError(error);
    throw error;
  }
}

export async function fetchConfig(url: string): Promise<{ status: number }> {
  try {
    const headers: Record<string, string> = {};
    const context = requestContext.getStore();
    if (context) headers['X-Request-Id'] = context.requestId;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
    if (response.body) {
      await response.body.cancel();
    }
    if (!response.ok) {
      throw new AppError(response.status);
    }
    logger.info(String(response.status), { phase: 'fetch' });
    return { status: response.status };
  } catch (error: unknown) {
    reportAsyncError(error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(502, { cause: error });
  }
}

app.post('/ex7/:cenario', async (req, res) => {
  const configDirectory = path.resolve(__dirname, '../config');
  const configs: Record<string, string> = {
    valido: path.join(configDirectory, 'valido.json'),
    ausente: path.join(configDirectory, 'ausente.json'),
    invalido: path.join(configDirectory, 'invalido.json')
  };
  const scenario = req.params.cenario;
  if (Object.hasOwn(configs, scenario)) {
    const config = await readConfig(configs[scenario]);
    logger.info('200', { config });
    res.json({ code: 200, exercise: req.exercise });
  } else if (scenario === 'timer') {
    await retryLater();
    res.json({ code: 200, exercise: req.exercise });
  } else if (scenario === 'original') {
    const results = await Promise.allSettled([readConfig(configs.ausente), retryLater()]);
    const errors: unknown[] = [];
    for (const result of results) {
      if (result.status === 'rejected') {
        errors.push(result.reason);
      }
    }
    if (errors.length > 0) {
      throw new AggregateError(errors, 'error');
    }
    res.json({ code: 200, exercise: req.exercise });
  } else if (scenario === 'fetch-rede') {
    await fetchConfig('http://host-inexistente.invalid');
    res.json({ code: 200, exercise: req.exercise });
  } else if (scenario === 'fetch-404') {
    await fetchConfig(`http://127.0.0.1:${req.socket.localPort}/rota-inexistente`);
    res.json({ code: 200, exercise: req.exercise });
  } else {
    throw new AppError(400);
  }
});

// ===== 8 =====
interface User {
  id: string;
  name: string;
}
const users: Record<string, User> = {
  '1': { id: '1', name: 'Ana' },
  '2': { id: '2', name: 'Bruno' }
};
async function findUser(id: string): Promise<User | undefined> {
  await new Promise(resolve => setTimeout(resolve, 30));
  if (id === 'falha') {
    throw new Error('error');
  }
  if (Object.hasOwn(users, id)) {
    return users[id];
  }
  return undefined;
}
app.get('/ex8/usuarios/:id', async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) throw new AppError(404);
  logger.info('200', { userId: user.id });
  res.json({ code: 200, exercise: req.exercise });
});
app.get('/ex8/erro', (_req, _res) => {
  throw new Error('error');
});
app.get('/ex8/erro-async', async (req, res) => {
  await findUser('falha');
  res.json({ code: 200, exercise: req.exercise });
});

// ===== 9 =====
app.get('/ex9/pedidos/:id', async (req, res) => {
  logger.info('200', { phase: 'lookup' });
  await new Promise(resolve => setTimeout(resolve, 100));
  const total = await processOrder(req.params.id);
  logger.info('200', { phase: 'result', total });
  res.json({ code: 200, exercise: req.exercise });
});

// ===== 10 =====
interface Item {
  price: number;
  qty: number;
}
export function applyDiscount(items: Item[]): number {
  let total = 0;
  let applied = 0;
  for (let index = 0; index < items.length; index++) {
    total += items[index].price * items[index].qty;
  }
  if (total > 200) {
    total -= total * 0.05;
    applied++;
  }
  return Number(total.toFixed(2));
}
const original: Item[] = [
  { price: 100, qty: 1 },
  { price: 150, qty: 1 },
  { price: 50, qty: 2 }
];
const scenarios: Record<string, Item[]> = {
  original,
  invertida: [...original].reverse(),
  reordenada: [original[1], original[0], original[2]],
  '180': [{ price: 180, qty: 1 }],
  '200': [{ price: 200, qty: 1 }],
  '500': [{ price: 500, qty: 1 }],
  vazia: []
};
app.get('/ex10/:cenario', (req, res) => {
  const scenario = req.params.cenario;
  if (!Object.hasOwn(scenarios, scenario)) {
    throw new AppError(400);
  }
  const total = applyDiscount(scenarios[scenario]);
  logger.info('200', { scenario, total });
  res.json({ code: 200, exercise: req.exercise });
});

// ===== 11 =====
const CACHE_LIMIT = 20;
const CACHE_TTL_MS = 1000;
const cache = new Map<string, { buffer: Buffer; expiresAt: number }>();
let cleanupTimer: NodeJS.Timeout | undefined;

function expireCache(): void {
  const now = Date.now();
  for (const [id, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(id);
  }
  if (cache.size === 0 && cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = undefined;
  }
}
function handleRequest(id: string): void {
  expireCache();
  if (!cache.has(id) && cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(id, { buffer: Buffer.alloc(1024 * 512), expiresAt: Date.now() + CACHE_TTL_MS });
  if (!cleanupTimer) {
    requestContext.exit(() => {
      cleanupTimer = setInterval(expireCache, CACHE_TTL_MS);
      cleanupTimer.unref();
    });
  }
}
export function clearMemoryCache(): void {
  cache.clear();
  if (cleanupTimer) clearInterval(cleanupTimer);
  cleanupTimer = undefined;
}
export function memorySnapshot(iteration: number) {
  const memory = process.memoryUsage();
  function mb(value: number): number {
    return Number((value / 1024 / 1024).toFixed(2));
  }
  let timers = 0;
  if (cleanupTimer) timers = 1;
  return {
    iteration, unit: 'MiB', rss: mb(memory.rss), heapTotal: mb(memory.heapTotal),
    heapUsed: mb(memory.heapUsed), external: mb(memory.external),
    arrayBuffers: mb(memory.arrayBuffers), cacheEntries: cache.size, timers
  };
}
let batch = 0;
let memoryBatchRunning = false;
app.post('/ex11/:iteracoes', async (req, res) => {
  const iterations = Number(req.params.iteracoes);
  if (iterations !== 200 && iterations !== 2000) {
    throw new AppError(400);
  }
  if (memoryBatchRunning) throw new AppError(409);
  memoryBatchRunning = true;
  try {
    batch++;
    for (let i = 0; i < iterations; i++) {
      handleRequest(`batch-${batch}-req-${i}`);
      if (i % 200 === 0) {
        const measurement = memorySnapshot(i);
        logger.info('200', measurement);
        await new Promise<void>(resolve => setImmediate(resolve));
      }
    }
    const final = memorySnapshot(iterations);
    logger.info('200', final);
    res.json({ code: 200, exercise: req.exercise });
  } finally {
    memoryBatchRunning = false;
  }
});

// ===== 8 =====
app.use((_req, _res, next) => next(new AppError(404)));

function errorDetails(error: unknown): unknown {
  if (error instanceof Error) {
    const details: Record<string, unknown> = { name: error.name, message: error.message, stack: error.stack };
    if (error.cause) details.cause = errorDetails(error.cause);
    if (error instanceof AggregateError) details.errors = error.errors.map(errorDetails);
    return details;
  }
  return String(error);
}
export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  logger.error('error', { error: errorDetails(error) });
  if (res.headersSent) {
    next(error);
    return;
  }
  let statusCode = 500;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  }
  res.status(statusCode).json({ error: 'error', code: statusCode, exercise: req.exercise });
};
app.use(errorHandler);

// ===== 4 / 11 =====
if (require.main === module) {
  let port = 3000;
  if (process.env.PORT) port = Number(process.env.PORT);
  const server = app.listen(port, () => logger.info('200', { exercise: 0, port }));
  function shutdown(): void {
    clearMemoryCache();
    server.close();
  }
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
