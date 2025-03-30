import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utility function to execute operations within a transaction
 * @param callback Function containing operations to execute in transaction
 * @returns Result of the transaction
 */
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(callback);
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
