"use client";

import * as React from "react";
import { BlockchainService } from "@/lib/blockchain";
import { toast } from "sonner";
import { ethers } from "ethers";
import TicketTrackerABI from "@/contracts/TicketTracker.json";
import { MetaMaskPrompt } from "@/components/metamask-prompt";

interface BlockchainTicket {
  ticketId: string;
  status: string;
  creator: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BlockchainEvent {
  ticketId: string;
  status: string;
  creator?: string;
  timestamp: number;
  transactionHash: string;
}

interface BlockchainContextType {
  isConnected: boolean;
  address: string | null;
  contract: ethers.Contract | null;
  connect: () => Promise<void>;
  createTicket: (ticketId: string) => Promise<string>;
  updateTicketStatus: (ticketId: string, status: string) => Promise<string>;
  getTicket: (ticketId: string) => Promise<BlockchainTicket>;
  getUserTickets: (address: string) => Promise<string[]>;
  events: BlockchainEvent[];
}

const BlockchainContext = React.createContext<BlockchainContextType | undefined>(
  undefined
);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [service, setService] = React.useState<BlockchainService | null>(null);
  const [contract, setContract] = React.useState<ethers.Contract | null>(null);
  const [events, setEvents] = React.useState<BlockchainEvent[]>([]);
  const [showMetaMaskPrompt, setShowMetaMaskPrompt] = React.useState(false);

  React.useEffect(() => {
    try {
      const blockchainService = new BlockchainService();
      setService(blockchainService);
      
      // Initialize contract
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contractInstance = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          TicketTrackerABI.abi,
          provider
        );
        setContract(contractInstance);

        // Listen for contract events
        contractInstance.on("TicketCreated", (ticketId, status, creator, timestamp, event) => {
          const newEvent: BlockchainEvent = {
            ticketId,
            status,
            creator,
            timestamp: timestamp.toNumber(),
            transactionHash: event.transactionHash,
          };
          setEvents((prev) => [newEvent, ...prev]);
          toast.success("Ticket Created", {
            description: `Ticket ${ticketId} has been created on the blockchain.`,
          });
        });

        contractInstance.on("TicketUpdated", (ticketId, status, timestamp, event) => {
          const newEvent: BlockchainEvent = {
            ticketId,
            status,
            timestamp: timestamp.toNumber(),
            transactionHash: event.transactionHash,
          };
          setEvents((prev) => [newEvent, ...prev]);
          toast.success("Ticket Updated", {
            description: `Ticket ${ticketId} has been updated on the blockchain.`,
          });
        });

        // Clean up event listeners
        return () => {
          contractInstance.removeAllListeners();
        };
      }
    } catch (error) {
      if ((error as Error).message.includes("MetaMask not found")) {
        setShowMetaMaskPrompt(true);
      }
      console.error("Failed to initialize blockchain service:", error);
    }
  }, []);

  // Network change handler
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = () => {
        window.location.reload();
      };

      const ethereum = window.ethereum;
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Account change handler
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setAddress(null);
          toast.error("Wallet Disconnected", {
            description: "Your wallet has been disconnected.",
          });
        } else if (accounts[0] !== address) {
          setAddress(accounts[0]);
          setIsConnected(true);
          toast.success("Account Changed", {
            description: "Your wallet account has changed.",
          });
        }
      };

      const ethereum = window.ethereum;
      ethereum.on("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged as (...args: unknown[]) => void);
      };
    }
  }, [address]);

  const connect = async () => {
    if (!service) {
      if (typeof window !== "undefined" && !window.ethereum) {
        setShowMetaMaskPrompt(true);
        return;
      }
      toast.error("Error", {
        description: "Web3 provider not found. Please install MetaMask.",
      });
      return;
    }

    try {
      const userAddress = await service.connectWallet();
      setAddress(userAddress);
      setIsConnected(true);
      toast.success("Success", {
        description: "Wallet connected successfully.",
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if ((error as Error).message.includes("MetaMask")) {
        setShowMetaMaskPrompt(true);
      } else {
        toast.error("Error", {
          description: "Failed to connect wallet. Please try again.",
        });
      }
    }
  };

  const createTicket = async (ticketId: string) => {
    if (!service || !isConnected) {
      throw new Error("Not connected to blockchain");
    }
    return service.createTicket(ticketId);
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    if (!service || !isConnected) {
      throw new Error("Not connected to blockchain");
    }
    return service.updateTicketStatus(ticketId, status);
  };

  const getTicket = async (ticketId: string) => {
    if (!service) {
      throw new Error("Blockchain service not initialized");
    }
    return service.getTicket(ticketId);
  };

  const getUserTickets = async (userAddress: string) => {
    if (!service) {
      throw new Error("Blockchain service not initialized");
    }
    return service.getUserTickets(userAddress);
  };

  return (
    <BlockchainContext.Provider
      value={{
        isConnected,
        address,
        contract,
        connect,
        createTicket,
        updateTicketStatus,
        getTicket,
        getUserTickets,
        events,
      }}
    >
      {children}
      {showMetaMaskPrompt && <MetaMaskPrompt />}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = React.useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
} 