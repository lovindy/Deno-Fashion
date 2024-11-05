// app/api/customer/cart/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  if (userId instanceof NextResponse) return userId;

  try {
    const { productId, variantId, quantity } = await req.json();

    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
      },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}
