'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VeriAIConnectButton } from '@/components/ui/veriAIConnectButton';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Shield, Zap } from 'lucide-react';

export function WalletConnectionPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-8 flex items-center justify-center"
            >
              <Wallet className="h-10 w-10 text-primary-foreground" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Connect Your Wallet
                </h1>
                <p className="text-lg text-muted-foreground">
                  Connect your wallet to access the VeriAI dashboard and start verifying AI content with cryptographic proof.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 my-8">
                <div className="flex items-center justify-center space-x-3 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Secure & Decentralized</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">Instant Verification</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-center"
              >
                <VeriAIConnectButton size="lg" />
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}