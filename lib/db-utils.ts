import { Prisma } from "@prisma/client";
import { db } from "./db";

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
}

export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  { maxRetries = 3, delayMs = 1000 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt === maxRetries) break;
      
      // If it's a connection error, wait before retrying
      if (error instanceof Error && 
          (error.message.includes('connection') || 
           error.message.includes('DNS resolution'))) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      
      // For other errors, throw immediately
      throw new DatabaseError(
        'Database operation failed',
        error
      );
    }
  }
  
  // If we've exhausted all retries
  throw new DatabaseError(
    `Database operation failed after ${maxRetries} attempts`,
    lastError
  );
}

// Wrapper for common database operations
export async function findTicket(id: string) {
  return withRetry(() => db.ticket.findUnique({
    where: { id },
    include: {
      createdBy: true,
      assignedTo: true,
      comments: {
        include: {
          user: true
        }
      }
    }
  }));
}

export async function findTickets(options: Prisma.TicketFindManyArgs) {
  return withRetry(() => db.ticket.findMany(options));
}

export async function countTickets(options: Prisma.TicketCountArgs) {
  return withRetry(() => db.ticket.count(options));
} 