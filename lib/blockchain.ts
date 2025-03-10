import { ethers } from "ethers";
import TicketTrackerABI from "@/contracts/TicketTracker.json";

export class BlockchainService {
  private provider: ethers.providers.Web3Provider;
  private contract: ethers.Contract;

  constructor() {
    if (typeof window === "undefined") {
      throw new Error("BlockchainService must be used in browser environment");
    }

    if (!window.ethereum) {
      throw new Error(
        "MetaMask not found. Please install MetaMask from https://metamask.io/"
      );
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      TicketTrackerABI.abi,
      this.provider
    );
  }

  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum?.isMetaMask) {
        window.open("https://metamask.io/", "_blank");
        throw new Error("Please install MetaMask to use this feature");
      }

      const accounts = await this.provider.send("eth_requestAccounts", []);
      return accounts[0];
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new Error("Please connect your MetaMask wallet");
      }
      throw error;
    }
  }

  async createTicket(ticketId: string): Promise<string> {
    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.createTicket(ticketId);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to create ticket on blockchain:", error);
      throw error;
    }
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<string> {
    try {
      const signer = this.provider.getSigner();
      const contractWithSigner = this.contract.connect(signer);
      const tx = await contractWithSigner.updateTicketStatus(ticketId, status);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Failed to update ticket status on blockchain:", error);
      throw error;
    }
  }

  async getTicket(ticketId: string) {
    try {
      const ticket = await this.contract.getTicket(ticketId);
      return {
        ticketId: ticket.ticketId,
        status: ticket.status,
        creator: ticket.creator,
        createdAt: new Date(ticket.createdAt.toNumber() * 1000),
        updatedAt: new Date(ticket.updatedAt.toNumber() * 1000),
      };
    } catch (error) {
      console.error("Failed to get ticket from blockchain:", error);
      throw error;
    }
  }

  async getUserTickets(address: string): Promise<string[]> {
    try {
      return await this.contract.getUserTickets(address);
    } catch (error) {
      console.error("Failed to get user tickets from blockchain:", error);
      throw error;
    }
  }
} 