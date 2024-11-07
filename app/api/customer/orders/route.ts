// Fixed formatting and added proper types to remove 'any'
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';
import { OrderItem, CreateOrderRequest } from '@/types/order';

export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (userId instanceof NextResponse) return userId;

  try {
    const { items, addressId } = (await req.json()) as CreateOrderRequest;

    const order = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          addressId,
          items: {
            create: items.map((item: OrderItem) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
          subtotal: items.reduce(
            (acc: number, item: OrderItem) => acc + item.price * item.quantity,
            0
          ),
          tax: 0,
          shipping: 0,
          total: 0,
        },
      });

      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
