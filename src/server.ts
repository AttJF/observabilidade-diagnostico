import express from 'express';
import { logger } from './logger';
import { processOrder } from './orders';
import { requestLogger } from './requestLogger';

const app = express();
app.use(requestLogger);


app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/usuarios/:id', (req, res) => res.json({ id: req.params.id }));
app.get('/lento', async (_req, res) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  res.json({ ok: true });
});
app.get('/erro', (_req, _res) => {
  throw new Error('erro de exemplo');
});
app.get('/pedidos/:id', async (req, res) => {
  const total = await processOrder(req.params.id);
  res.json({ total });
});

app.get('/crash', async (_req, res) => {
  await new Promise<void>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('falha ao processar a fila'));
    }, 100);
  });

  res.json({ ok: true });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('erro na requisição', { error: { message: error.message, stack: error.stack } });
  res.status(500).json({ error: 'Erro interno' });
});

let port = 3000;
if (process.env.PORT) {
  port = Number(process.env.PORT);
}
app.listen(port, () => {
  logger.info('servidor iniciado', { port });
});
