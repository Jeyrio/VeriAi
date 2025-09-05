"use client";

import React from 'react';
import { Web3AuthWalletButton } from '@/components/wallet/web3auth-wallet-button';

interface VeriAIConnectButtonProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function VeriAIConnectButton({ 
  className, 
  variant = 'default',
  size = 'default' 
}: VeriAIConnectButtonProps) {
  // Use the new Web3Auth wallet button
  return <Web3AuthWalletButton />;
}