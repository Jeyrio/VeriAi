'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Zap, ArrowRight, Sparkles, Bot, Lock } from 'lucide-react';
import { Web3AuthWalletButton } from '@/components/wallet/web3auth-wallet-button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-chart-5/10 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.04] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-6 py-3 text-sm font-medium"
              >
                <Zap className="mr-2 h-4 w-4 text-primary" />
                <span className="text-primary">Powered by Flare Data Connector</span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
                >
                  <span className="bg-gradient-to-r from-primary via-accent to-chart-5 bg-clip-text text-transparent">
                    Verify AI Content
                  </span>
                  <br />
                  <span className="text-foreground">On-Chain</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl text-muted-foreground leading-relaxed max-w-xl"
                >
                  Get cryptographic proof of AI-generated content authenticity using Flare's 
                  decentralized Data Connector. Transform AI outputs into immutable verification certificates.
                </motion.p>
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                  <Shield className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                  Learn More
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center space-x-8 pt-4"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">15.4K+</div>
                  <div className="text-sm text-muted-foreground">Verifications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">8.5K+</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-3">99.2%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto max-w-md">
                {/* Main Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="relative bg-card/80 backdrop-blur border-2 border-primary/20 rounded-2xl p-8 shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">AI Generation</p>
                        <p className="text-sm text-muted-foreground">GPT-4 Turbo</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, delay: 1 }}
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Verifying authenticity...</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                        className="w-5 h-5 bg-chart-3 rounded-full flex items-center justify-center"
                      >
                        <Shield className="w-3 h-3 text-white" />
                      </motion.div>
                      <span className="text-sm font-medium text-chart-3">Verified & Certified</span>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="absolute -top-4 -right-4 bg-chart-5 text-white p-3 rounded-full shadow-lg"
                  >
                    <Lock className="w-4 h-4" />
                  </motion.div>
                </motion.div>

                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">2.3s</div>
                    <div className="text-xs text-muted-foreground">Avg Verification</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="absolute -top-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-chart-3">100%</div>
                    <div className="text-xs text-muted-foreground">Decentralized</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
