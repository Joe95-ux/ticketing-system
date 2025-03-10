interface EthereumRequestArguments {
  method: string;
  params?: unknown[];
}

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: EthereumRequestArguments) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  };
} 