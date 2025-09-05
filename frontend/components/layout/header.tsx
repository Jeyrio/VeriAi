'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VeriAIConnectButton } from '@/components/ui/veriAIConnectButton';
import { Button } from '@/components/ui/button';
import { 
  Verified, 
  Image, 
  BarChart3, 
  Menu, 
  X,
  Sun,
  Moon,
  Shield,
  Sparkles,
  User
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { VeriAILogo } from '@/components/ui/veri-ai-logo';

const navigation = [
  { name: 'Features', href: '#features', icon: Sparkles },
  { name: 'How It Works', href: '#how-it-works', icon: Shield },
  { name: 'Pricing', href: '#pricing', icon: Sparkles },
  { name: 'Dashboard', href: '/dashboard', icon: User },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <VeriAILogo size="md" animated />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden md:flex"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Connect Wallet */}
          <VeriAIConnectButton />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Mobile theme toggle */}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 ml-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                Theme
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
