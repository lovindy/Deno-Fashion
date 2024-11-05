// app/api/customer/orders/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (userId instanceof NextResponse) return userId;

  try {
    const { items, addressId, paymentDetails } = await req.json();

    const order = await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          addressId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
          subtotal: items.reduce(
            (acc: number, item: any) => acc + item.price * item.quantity,
            0
          ),
          tax: 0, // Calculate tax
          shipping: 0, // Calculate shipping
          total: 0, // Calculate total
        },
      });

      // Clear the user's cart after successful order creation
      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
