import { logger } from './logger';

type Order = {
  email: string;
  items: Array<{ price: number }>;
};

const orders: Record<string, Order> = {
  '1': { email: 'teste1', items: [{ price: 10 }, { price: 20 }] },
  '2': { email: 'teste2', items: [{ price: 15 }] }
};

async function findOrder(orderId: string): Promise<Order> {
  const order = orders[orderId];
  if (!order) throw new Error(`Pedido ${orderId} não encontrado`);
  return order;
}

// Exercício 4: observe os logs de sucesso, erro e dados sensíveis antes de corrigir.
export async function processOrder(orderId: string): Promise<number> {
  logger.info('inicio do processamento', { orderId });

  try {
    const order = await findOrder(orderId);
    const total = order.items.reduce((sum, item) => sum + item.price, 0);

    return total;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('erro ao processar pedido', {
        orderId,
        error: { message: error.message, stack: error.stack }
      });
    } else {
      logger.error('erro ao processar pedido', { orderId, error: String(error) });
    }

    throw error;
  } finally {
    logger.info('fim do processamento', { orderId });
  }
}
