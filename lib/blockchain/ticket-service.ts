import { 
  Contract, 
  ContractInterface,
  providers,
  Signer
} from 'ethers';
import { TransactionManager, TransactionStatus } from './transaction-manager';

export interface TransactionResult {
  transactionId: string;
  hash: string;
}

export class TicketBlockchainService {
  private readonly transactionManager: TransactionManager;
  private readonly contract: Contract;
  private readonly provider: providers.Provider;

  constructor(
    provider: providers.Provider,
    contractAddress: string,
    contractABI: ContractInterface
  ) {
    this.provider = provider;
    this.transactionManager = new TransactionManager(provider);
    this.contract = new Contract(contractAddress, contractABI, provider);
  }

  onTransactionStatusChange(
    callback: (id: string, status: TransactionStatus, error?: string) => void
  ) {
    return this.transactionManager.onStatusChange(callback);
  }

  async createTicketRecord(
    ticketId: string,
    metadata: string
  ): Promise<TransactionResult> {
    const transactionId = `create-ticket-${ticketId}-${Date.now()}`;
    
    const hash = await this.transactionManager.submitTransaction(
      transactionId,
      async () => {
        const signer = await this.getSigner();
        return this.contract.connect(signer).createTicketRecord(ticketId, metadata);
      }
    );

    return { transactionId, hash };
  }

  async updateTicketStatus(
    ticketId: string,
    status: string
  ): Promise<TransactionResult> {
    const transactionId = `update-status-${ticketId}-${status}-${Date.now()}`;
    
    const hash = await this.transactionManager.submitTransaction(
      transactionId,
      async () => {
        const signer = await this.getSigner();
        return this.contract.connect(signer).updateTicketStatus(ticketId, status);
      }
    );

    return { transactionId, hash };
  }

  async getTransactionStatus(transactionId: string): Promise<TransactionStatus | null> {
    return this.transactionManager.getTransactionStatus(transactionId);
  }

  getTransactionError(transactionId: string): string | undefined {
    return this.transactionManager.getTransactionError(transactionId);
  }

  private async getSigner(): Promise<Signer> {
    if (!(this.provider instanceof providers.Web3Provider)) {
      throw new Error('Provider must be a Web3Provider');
    }
    return this.provider.getSigner();
  }
} 