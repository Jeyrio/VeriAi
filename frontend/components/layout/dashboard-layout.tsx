'use client';

import React, { useState, useEffect } from 'react';
import { useWeb3AuthMultichain } from '@/hooks/use-web3auth-multichain';
import { Web3AuthWalletButton } from '@/components/wallet/web3auth-wallet-button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './sidebar';
import { Button } from '@/components/ui/button';
import { 
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

interface Notification {
  id: string;
  type: 'verification' | 'challenge' | 'marketplace' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'verification',
    title: 'Verification Complete',
    message: 'Your AI content has been successfully verified and NFT minted',
    timestamp: '2 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'challenge',
    title: 'Challenge Update',
    message: 'Your challenge CHG_001 has been reviewed and upheld',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: '3',
    type: 'marketplace',
    title: 'NFT Sold',
    message: 'Your verification NFT VER_045 has been sold for 0.5 FLR',
    timestamp: '3 hours ago',
    read: true
  }
];

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { primaryAddress: address, isConnected } = useWeb3AuthMultichain();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'verification': return CheckCircle;
      case 'challenge': return Trophy;
      case 'marketplace': return Sparkles;
      case 'system': return AlertTriangle;
      default: return Bell;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };


  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={toggleMobileMenu}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <Sidebar isCollapsed={false} onToggle={toggleMobileMenu} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-foreground">
                {title || 'Dashboard'}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search verifications, NFTs, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            {/* Mobile Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between p-3">
                  <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(notification.type);
                      return (
                        <DropdownMenuItem
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={cn(
                            "p-3 cursor-pointer",
                            !notification.read && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <NotificationIcon className={cn(
                              "h-4 w-4 mt-0.5 shrink-0",
                              notification.type === 'verification' && "text-green-500",
                              notification.type === 'challenge' && "text-yellow-500",
                              notification.type === 'marketplace' && "text-purple-500",
                              notification.type === 'system' && "text-red-500"
                            )} />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{notification.title}</p>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-3 text-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:flex"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              {mounted && address && (
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              )}
              <Web3AuthWalletButton />
            </div>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b bg-background/95 backdrop-blur px-4 py-3 md:hidden"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search verifications, NFTs, activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  autoFocus
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto p-6 max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}