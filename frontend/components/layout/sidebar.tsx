'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Sparkles,
  Shield,
  BarChart3,
  Store,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  Users,
  LogOut
} from 'lucide-react';
import { VeriAILogo } from '@/components/ui/veri-ai-logo';
import { useDisconnect } from 'wagmi';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview & Stats'
  },
  {
    name: 'Generate',
    href: '/dashboard/generate',
    icon: Sparkles,
    description: 'AI Content Creation'
  },
  {
    name: 'Verify',
    href: '/dashboard/verify',
    icon: Shield,
    description: 'Content Verification'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Performance Insights'
  },
  {
    name: 'Collection',
    href: '/dashboard/collection',
    icon: Database,
    description: 'NFT Collection'
  },
  {
    name: 'Marketplace',
    href: '/dashboard/marketplace',
    icon: Store,
    description: 'Trade NFTs'
  },
  {
    name: 'Challenges',
    href: '/dashboard/challenge',
    icon: Trophy,
    description: 'Active Challenges'
  },
];

const bottomNavigation = [
  {
    name: 'Activity',
    href: '/dashboard/activity',
    icon: Activity,
    description: 'Recent Activity'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account Settings'
  },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { disconnect } = useDisconnect();

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="relative flex h-screen flex-col border-r bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60"
    >
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 z-20 h-6 w-6 rounded-full border bg-background shadow-md"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/">
          <VeriAILogo size={isCollapsed ? "sm" : "md"} animated />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard'
            : pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 overflow-hidden"
                    >
                      <div className="whitespace-nowrap">{item.name}</div>
                      {!isActive && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="mt-auto border-t p-4 space-y-3">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 overflow-hidden"
                    >
                      <div className="whitespace-nowrap">{item.name}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
        
        {/* Separator */}
        <div className="border-t border-border/50 mx-3"></div>
        
        {/* Disconnect Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            onClick={() => disconnect()}
            className={cn(
              "w-full justify-start rounded-lg px-3 py-3 text-sm font-medium transition-colors text-sidebar-foreground hover:bg-red-500/10 hover:text-red-500"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 overflow-hidden"
                >
                  <div className="whitespace-nowrap">Disconnect</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}