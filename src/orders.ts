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
  if (!Object.hasOwn(orders, orderId)) throw new Error('error');
  return order;
}

// ===== 4 =====
export async function processOrder(orderId: string): Promise<number> {
  logger.info('200', { phase: 'order-start', orderId });

  try {
    const order = await findOrder(orderId);
    const total = order.items.reduce((sum, item) => sum + item.price, 0);

    return total;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('error', {
        orderId,
        error: { message: error.message, stack: error.stack }
      });
    } else {
      logger.error('error', { orderId, error: String(error) });
    }

    throw error;
  } finally {
    logger.info('200', { phase: 'order-end', orderId });
  }
}
