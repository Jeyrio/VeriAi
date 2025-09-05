'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useVeriAIAuth } from '@/hooks/useVeriAIAuth';
import { Header } from './header';
import { Footer } from './footer';
import { WalletConnectionPage } from './wallet-connection-page';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isConnected } = useVeriAIAuth();
  const [mounted, setMounted] = useState(false);
  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show loading state during hydration to prevent mismatch
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isDashboard && !isConnected) {
    // Dashboard without wallet - show wallet connection page with header/footer
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <WalletConnectionPage />
        </main>
        <Footer />
      </div>
    );
  }

  if (isDashboard) {
    // Dashboard with wallet - no header/footer, children contain the dashboard layout
    return <>{children}</>;
  }

  // Landing page layout - with header and footer
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}