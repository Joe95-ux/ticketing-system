import { ContractTransaction, providers } from 'ethers';

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'FAILED';

interface TransactionRecord {
  id: string;
  hash?: string;
  status: TransactionStatus;
  attempts: number;
  lastAttempt: Date;
  error?: string;
}

type StatusListener = (id: string, status: TransactionStatus, error?: string) => void;

export class TransactionManager {
  private transactions: Map<string, TransactionRecord> = new Map();
  private listeners: Set<StatusListener> = new Set();
  private readonly maxAttempts: number;
  private readonly confirmationBlocks: number;
  private readonly provider: providers.Provider;

  constructor(
    provider: providers.Provider,
    maxAttempts: number = 3,
    confirmationBlocks: number = 2
  ) {
    this.provider = provider;
    this.maxAttempts = maxAttempts;
    this.confirmationBlocks = confirmationBlocks;
  }

  onStatusChange(listener: StatusListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitStatus(id: string, status: TransactionStatus, error?: string) {
    this.listeners.forEach(listener => listener(id, status, error));
  }

  async submitTransaction(
    id: string,
    transactionFn: () => Promise<ContractTransaction>
  ): Promise<string> {
    // Check if transaction is already being processed
    const existing = this.transactions.get(id);
    if (existing) {
      if (existing.status === 'CONFIRMED') {
        return existing.hash!;
      }
      if (existing.status === 'PROCESSING' || existing.status === 'PENDING') {
        throw new Error('Transaction already in progress');
      }
      if (existing.attempts >= this.maxAttempts) {
        throw new Error('Max retry attempts reached');
      }
    }

    // Create or update transaction record
    const record: TransactionRecord = {
      id,
      status: 'PENDING',
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttempt: new Date()
    };
    this.transactions.set(id, record);
    this.emitStatus(id, 'PENDING');

    try {
      // Submit transaction
      record.status = 'PROCESSING';
      this.emitStatus(id, 'PROCESSING');
      
      const tx = await transactionFn();
      record.hash = tx.hash;
      
      // Wait for confirmations
      try {
        await tx.wait(this.confirmationBlocks);
        record.status = 'CONFIRMED';
        this.emitStatus(id, 'CONFIRMED');
        return tx.hash;
      } catch (confirmError) {
        // Check if transaction was actually mined despite confirmation error
        const receipt = await this.provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.blockNumber) {
          record.status = 'CONFIRMED';
          this.emitStatus(id, 'CONFIRMED');
          return tx.hash;
        }
        throw confirmError;
      }
    } catch (error) {
      record.status = 'FAILED';
      record.error = error instanceof Error ? error.message : 'Unknown error';
      this.emitStatus(id, 'FAILED', record.error);
      throw error;
    } finally {
      this.transactions.set(id, record);
    }
  }

  getTransactionStatus(id: string): TransactionStatus | null {
    return this.transactions.get(id)?.status || null;
  }

  getTransactionError(id: string): string | undefined {
    return this.transactions.get(id)?.error;
  }

  async waitForTransaction(id: string, timeoutMs: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const status = this.getTransactionStatus(id);
      if (status === 'CONFIRMED') return true;
      if (status === 'FAILED') return false;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Transaction wait timeout');
  }
} 