// lib/auth-utils.ts
import { prisma } from './prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import type { NextRequest } from 'next/server';

// Types
export type AuthResult = string | NextResponse;
export type AdminResult = { userId: string; user: User } | NextResponse;

// Define interface for Clerk user data
interface ClerkUserData {
  email_addresses: Array<{
    email_address: string;
    verification?: {
      status: 'verified' | 'unverified';
    };
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

// Super admin email - store this in environment variables
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;

export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const auth = getAuth(req);
  if (!auth.userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  return auth.userId;
}

export async function requireSuperAdmin(
  req: NextRequest
): Promise<AdminResult> {
  const auth = getAuth(req);
  if (!auth.userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  });

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return new NextResponse('Forbidden: Super Admin access required', {
      status: 403,
    });
  }

  return { userId: auth.userId, user };
}

// Sync Clerk user with our database
export async function syncUserWithDatabase(userId: string, userData: any) {
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: userData.email_addresses?.[0]?.email_address,
      firstName: userData.first_name,
      lastName: userData.last_name,
      imageUrl: userData.image_url,
      isEmailVerified:
        userData.email_addresses?.[0]?.verification?.status === 'verified',
    },
    create: {
      id: userId,
      email: userData.email_addresses?.[0]?.email_address,
      firstName: userData.first_name,
      lastName: userData.last_name,
      imageUrl: userData.image_url,
      isEmailVerified:
        userData.email_addresses?.[0]?.verification?.status === 'verified',
      role:
        userData.email_addresses?.[0]?.email_address === SUPER_ADMIN_EMAIL
          ? 'ADMIN'
          : 'CUSTOMER',
    },
  });

  return user;
}
