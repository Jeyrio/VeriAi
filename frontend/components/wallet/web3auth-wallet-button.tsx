"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wallet, LogOut, User, Loader2, LayoutDashboard, RefreshCw, Globe, Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWeb3AuthMultichain, WalletStatus } from "@/hooks/use-web3auth-multichain";
import { useState } from "react";

export function Web3AuthWalletButton() {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Safely try to get wallet state, fallback if not available
  let wallet: any = {
    status: WalletStatus.DISCONNECTED,
    isConnected: false,
    handleConnect: async () => {},
    handleDisconnect: () => {},
    userInfo: null,
    primaryAddress: null,
    isConnecting: false,
    solana: { balance: null },
    ethereum: { balance: null },
    formatAddress: (addr?: string, chars = 4) => {
      if (!addr) return "";
      if (addr.length <= 8) return addr;
      return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
    }
  };
  
  try {
    wallet = useWeb3AuthMultichain();
  } catch (error) {
    // Web3Auth context not available, use fallback state
    console.log('Web3Auth context not available in WalletButton, using fallback state');
  }

  // Check if we're on a dashboard page
  const isOnDashboard = pathname?.startsWith('/dashboard');

  // Get display content based on user info or addresses
  const getDisplayContent = () => {
    // If we have user name, show initials
    if (wallet.userInfo?.name) {
      const names = wallet.userInfo.name.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0]; // First letter of first and last name
      } else {
        return names[0][0] + (names[0][1] || ''); // First two letters if single name
      }
    }
    
    // If we have address, show truncated version
    if (wallet.primaryAddress) {
      return wallet.formatAddress(wallet.primaryAddress);
    }
    
    // Default connected state
    return '••';
  };

  // Handle connection using Web3Auth's built-in modal
  const handleConnect = async () => {
    try {
      // Use Web3Auth's built-in modal - shows all login methods automatically
      await wallet.handleConnect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  // Show connect button when not connected
  if (!wallet.isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={wallet.isConnecting}
        size="sm"
        className="group relative bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-600/30 transition-all duration-300 font-semibold px-2 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm w-8 h-8 sm:w-auto sm:h-auto rounded-full sm:rounded-md"
      >
        {wallet.isConnecting ? (
          <span className="relative z-10 flex items-center">
            <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
            <span className="hidden sm:inline ml-2">Connecting...</span>
          </span>
        ) : (
          <span className="relative z-10 flex items-center">
            <Wallet className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline ml-2">Connect Wallet</span>
          </span>
        )}
        <div className="absolute inset-0 bg-indigo-500 rounded-full sm:rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </Button>
    );
  }

  // Connected state - show comprehensive multichain dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="relative flex items-center justify-center border-indigo-300/30 dark:border-indigo-600/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 w-8 h-8 sm:w-9 sm:h-9 p-0 rounded-full"
        >
          {wallet.userInfo?.profileImage ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={wallet.userInfo.profileImage} className="rounded-full" />
              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                {getDisplayContent()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              {getDisplayContent()}
            </div>
          )}
          
          {/* Multichain indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          VeriAI Multichain Wallet
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* User Info */}
        {wallet.userInfo?.email && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            📧 {wallet.userInfo.email}
          </DropdownMenuItem>
        )}
        
        {/* Auth Method */}
        {wallet.authMethod && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            🔐 {wallet.authMethod}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Debug info - temporary */}
        <DropdownMenuItem disabled className="text-xs text-gray-500">
          Debug: ETH connected: {wallet.ethereum?.isConnected ? 'YES' : 'NO'}, SOL connected: {wallet.solana?.isConnected ? 'YES' : 'NO'}
        </DropdownMenuItem>
        
        {/* Ethereum Chain Info */}
        {wallet.ethereum?.isConnected && (
          <>
            <DropdownMenuLabel className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              ⟠ Ethereum {wallet.ethereum.chainId && `(Chain ${wallet.ethereum.chainId})`}
            </DropdownMenuLabel>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground font-mono ml-4">
              {wallet.formatAddress(wallet.ethereum.address)}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground ml-4 flex items-center justify-between">
              <span>Balance:</span>
              <span className="flex items-center gap-1">
                {wallet.ethereum.isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  `${wallet.ethereum.balanceFormatted || '0'} ${wallet.ethereum.symbol}`
                )}
              </span>
            </DropdownMenuItem>
          </>
        )}
        
        {/* Solana Chain Info */}
        {wallet.solana?.isConnected && (
          <>
            <DropdownMenuLabel className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
              ◎ Solana ({wallet.solana.network})
            </DropdownMenuLabel>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground font-mono ml-4">
              {wallet.formatAddress(wallet.solana.address)}
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs text-muted-foreground ml-4 flex items-center justify-between">
              <span>Balance:</span>
              <span className="flex items-center gap-1">
                {wallet.solana.isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  `${wallet.solana.balanceFormatted || '0.0000'} ${wallet.solana.symbol}`
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => wallet.fetchSolanaBalance && wallet.fetchSolanaBalance(wallet.solana.address!)}
                  disabled={wallet.solana.isLoading}
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </span>
            </DropdownMenuItem>
          </>
        )}
        
        {/* Connection Status */}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {wallet.hasEthereumAddress && wallet.hasSolanaAddress ? 'Multichain Connected' : 
           wallet.hasEthereumAddress ? 'Ethereum Connected' : 
           wallet.hasSolanaAddress ? 'Solana Connected' : 'Connected'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Dashboard Link */}
        {!isOnDashboard && (
          <Link href="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </DropdownMenuItem>
          </Link>
        )}
        
        {/* Profile Link */}
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Disconnect */}
        <DropdownMenuItem
          onClick={wallet.handleDisconnect}
          disabled={wallet.isConnecting}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {wallet.isConnecting ? "Disconnecting..." : "Disconnect"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Web3AuthWalletButton;