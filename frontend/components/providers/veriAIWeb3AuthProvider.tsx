"use client";

import { Web3AuthProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IWeb3AuthState } from "@web3auth/modal";
import React, { ReactNode, useState, useEffect } from "react";
import { web3AuthContextConfig } from "@/lib/web3auth/config";

interface VeriAIWeb3AuthProviderProps {
  children: ReactNode;
  web3authInitialState?: IWeb3AuthState | undefined;
}

// Create a single QueryClient instance for Web3Auth's WagmiProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes  
    },
  },
});

export function VeriAIWeb3AuthProvider({ children, web3authInitialState }: VeriAIWeb3AuthProviderProps) {
  // Client-side only rendering to prevent hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render nothing on server-side to prevent hydration issues
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <Web3AuthProvider config={web3AuthContextConfig} initialState={web3authInitialState}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
