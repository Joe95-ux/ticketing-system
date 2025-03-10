"use client";

import * as React from "react";
import { useBlockchain } from "@/contexts/blockchain-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet } from "lucide-react";

export function WalletStatus() {
  const { isConnected, address, connect } = useBlockchain();
  const [network, setNetwork] = React.useState<string>("");

  React.useEffect(() => {
    async function getNetwork() {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          switch (chainId) {
            case "0x1":
              setNetwork("Ethereum Mainnet");
              break;
            case "0x5":
              setNetwork("Goerli Testnet");
              break;
            case "0xaa36a7":
              setNetwork("Sepolia Testnet");
              break;
            default:
              setNetwork("Unknown Network");
          }
        } catch (error) {
          console.error("Failed to get network:", error);
          setNetwork("Unknown Network");
        }
      }
    }

    if (isConnected) {
      getNetwork();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Button variant="outline" size="sm" onClick={() => connect()}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between">
          Network
          <span className="text-muted-foreground">{network}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <div>Address</div>
          <div className="text-xs text-muted-foreground break-all">
            {address}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 