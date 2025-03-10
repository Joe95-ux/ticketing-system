"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function MetaMaskPrompt() {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleInstall = () => {
    window.open("https://metamask.io/", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>MetaMask Required</DialogTitle>
          <DialogDescription>
            To use blockchain features, you need to install MetaMask, a secure wallet
            and gateway to blockchain apps.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInstall}>
            <Wallet className="mr-2 h-4 w-4" />
            Install MetaMask
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 