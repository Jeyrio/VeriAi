'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { VeriAIWeb3AuthProvider } from '@/components/providers/veriAIWeb3AuthProvider';
import { WalletProvider } from '@/lib/contexts/WalletContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <VeriAIWeb3AuthProvider>
      <WalletProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </WalletProvider>
    </VeriAIWeb3AuthProvider>
  );
}
