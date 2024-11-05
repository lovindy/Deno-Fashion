import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-utils';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Validation schema for product creation
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  comparePrice: z.number().optional(),
  cost: z.number().positive(),
  brandId: z.string(),
  sku: z.string(),
  slug: z.string(),
  variants: z
    .array(
      z.object({
        sku: z.string(),
        colorId: z.string(),
        sizeId: z.string(),
        stock: z.number().int().min(0),
        price: z.number().optional(),
      })
    )
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  // Change type to NextRequest
  const adminResult = await requireSuperAdmin(req); // Pass req as an argument
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const data = await req.json();

    // Validate input data
    const validatedData = productSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        variants: validatedData.variants
          ? {
              create: validatedData.variants,
            }
          : undefined,
        images: validatedData.images
          ? {
              create: validatedData.images,
            }
          : undefined,
      },
      include: {
        variants: {
          include: {
            color: true,
            size: true,
          },
        },
        images: true,
        brand: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Change type to NextRequest
  const adminResult = await requireSuperAdmin(req); // Pass req as an argument
  if (adminResult instanceof NextResponse) return adminResult;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          {
            name: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            sku: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
          },
        ],
      }),
      ...(category && {
        categories: {
          some: {
            category: {
              slug: category,
            },
          },
        },
      }),
      ...(brand && { brandId: brand }),
      ...(isActive && { isActive: isActive === 'true' }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            include: {
              color: true,
              size: true,
            },
          },
          images: true,
          brand: true,
          categories: {
            include: {
              category: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
