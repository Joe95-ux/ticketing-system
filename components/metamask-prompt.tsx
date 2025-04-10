"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      <DialogContent className="sm:max-w-[450px] p-6">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 relative">
            <img
              src="/metamask-fox.svg"
              alt="MetaMask Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <DialogTitle className="text-xl text-center">
            Install MetaMask
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-6">
            To use blockchain features, you need to install MetaMask, a secure
            wallet and gateway to blockchain apps.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            Not Now
          </Button>
          <Button
            onClick={handleInstall}
            className="w-full sm:w-auto bg-[#F6851B] hover:bg-[#E2761B] text-white"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Install MetaMask
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
