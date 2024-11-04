import { PrismaClient } from "@prisma/client";

// Define custom Prisma client logging and error handling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "stdout",
        level: "error",
      },
      {
        emit: "stdout",
        level: "info",
      },
      {
        emit: "stdout",
        level: "warn",
      },
    ],
    errorFormat: "pretty",
  });
};

// Define global type for PrismaClient
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Create singleton instance
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Set up event listeners for logging
prisma.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});

// Error handling middleware
prisma.$use(async (params, next) => {
  try {
    const result = await next(params);
    return result;
  } catch (error: any) {
    console.error(`Error in Prisma Client request:`, {
      model: params.model,
      action: params.action,
      error: error.message,
    });
    throw error;
  }
});

// Helper function for safe transactions
export async function prismaTransaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await fn(tx as PrismaClient);
    });
  } catch (error: any) {
    console.error("Transaction failed:", error);
    throw error;
  }
}

// Development-only debugging
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Export configured instance
export default prisma;

// Export type for use in other files
export type PrismaDB = typeof prisma;
