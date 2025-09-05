'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Rocket, Shield, Zap } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/50 shadow-2xl">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Rocket className="h-8 w-8" />
                </div>

                {/* Heading */}
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Ready to Verify?
                  </h2>
                  <p className="text-lg text-muted-foreground sm:text-xl">
                    Join the future of AI content authenticity. Start verifying your 
                    AI-generated content with cryptographic proof today.
                  </p>
                </div>

                {/* Features highlight */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Tamper-Proof</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Instant Verification</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Rocket className="h-4 w-4 text-blue-500" />
                    <span>Production Ready</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Link href="/verify">
                    <Button size="lg" className="w-full sm:w-auto group">
                      Start Verifying Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      View Analytics
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="pt-8 border-t">
                  <p className="text-sm text-muted-foreground">
                    Powered by{' '}
                    <a
                      href="https://flare.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Flare Network
                    </a>
                    {' '}• Secured by{' '}
                    <a
                      href="https://dev.flare.network/fdc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      Data Connector
                    </a>
                    {' '}• Open Source
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
