'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VeriAILogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function VeriAILogo({ className, size = 'md', animated = false }: VeriAILogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto'
  };

  const LogoContent = () => (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      <div className="relative flex items-center">
        {/* V Symbol with gradient */}
        <div className="relative">
          <svg
            viewBox="0 0 40 40"
            className={cn(
              'text-primary',
              size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12'
            )}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="veriGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                <stop offset="50%" stopColor="rgb(147, 51, 234)" />
                <stop offset="100%" stopColor="rgb(236, 72, 153)" />
              </linearGradient>
            </defs>
            {/* Outer V shape */}
            <path
              d="M8 8 L20 28 L32 8"
              stroke="url(#veriGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner checkmark for verification */}
            <path
              d="M16 20 L18 22 L24 16"
              stroke="rgb(34, 197, 94)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* AI circuit pattern */}
            <circle cx="12" cy="12" r="1.5" fill="rgb(20, 184, 166)" opacity="0.8" />
            <circle cx="28" cy="12" r="1.5" fill="rgb(20, 184, 166)" opacity="0.8" />
            <circle cx="20" cy="6" r="1" fill="rgb(168, 85, 247)" opacity="0.6" />
          </svg>
        </div>
        
        {/* Text */}
        <div className="ml-2 flex items-baseline">
          <span className={cn(
            'font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent',
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
          )}>
            Veri
          </span>
          <span className={cn(
            'font-bold text-foreground',
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
          )}>
            AI
          </span>
        </div>
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return <LogoContent />;
}