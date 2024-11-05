// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Allowed routes for users that are not signed in
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/products(.*)",
  "/categories(.*)",
  "/api/public(.*)",
  "/api/webhook/clerk(.*)",
]);

// Clerk middleware for checking if user is authenticated
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// lib/auth.ts
import { prisma } from "@/lib/prisma";
import { auth as getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { User } from "@prisma/client";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;

export async function requireAuth() {
  const { userId } = await getAuth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return userId;
}

export async function requireSuperAdmin() {
  const { userId } = await getAuth();
  const user = await currentUser();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get primary email from user object
  const primaryEmail = user?.emailAddresses?.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (primaryEmail !== SUPER_ADMIN_EMAIL) {
    return new NextResponse("Forbidden: Super Admin access required", {
      status: 403,
    });
  }

  return userId;
}

interface ClerkEmailAddress {
  id: string;
  emailAddress: string;
}

interface ClerkUserData {
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailVerified: boolean;
}

export async function syncUserWithDatabase(
  userId: string,
  userData: ClerkUserData
): Promise<User> {
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email: userData.email,
      firstName: userData.firstName ?? "",
      lastName: userData.lastName ?? "",
      imageUrl: userData.imageUrl,
      isEmailVerified: userData.emailVerified,
    },
    create: {
      id: userId,
      email: userData.email,
      firstName: userData.firstName ?? "",
      lastName: userData.lastName ?? "",
      imageUrl: userData.imageUrl,
      isEmailVerified: userData.emailVerified,
      role: userData.email === SUPER_ADMIN_EMAIL ? "ADMIN" : "CUSTOMER",
    },
  });

  return user;
}
