import { prisma } from './prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { ClerkUserData } from '@/types/user';

// Types
export type AuthResult = string | NextResponse;
export type AdminResult = { userId: string; user: User } | NextResponse;

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
export async function syncUserWithDatabase(
  userId: string,
  userData: ClerkUserData
) {
  console.log('Syncing user data:', userData);

  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: userData.email_addresses?.[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        imageUrl: userData.image_url || null,
        isEmailVerified:
          userData.email_addresses?.[0]?.verification?.status === 'verified',
        gender: userData.gender || null,
        dateOfBirth: userData.birthday ? new Date(userData.birthday) : null,
      },
      create: {
        id: userId,
        email: userData.email_addresses?.[0]?.email_address || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        imageUrl: userData.image_url || null,
        isEmailVerified:
          userData.email_addresses?.[0]?.verification?.status === 'verified',
        role:
          userData.email_addresses?.[0]?.email_address === SUPER_ADMIN_EMAIL
            ? 'ADMIN'
            : 'CUSTOMER',
        gender: userData.gender || null,
        dateOfBirth: userData.birthday ? new Date(userData.birthday) : null,
      },
    });

    console.log('User synced successfully:', user);
    return user;
  } catch (error) {
    console.error('Error syncing user with database:', error);
    throw error;
  }
}
