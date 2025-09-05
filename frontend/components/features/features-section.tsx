'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Zap, Database, CheckCircle, Globe, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Cryptographic Proof',
    description: 'Immutable verification certificates secured by blockchain technology with military-grade encryption',
    color: 'text-primary',
    gradient: 'from-primary to-primary/70',
  },
  {
    icon: Zap,
    title: 'Flare Data Connector',
    description: 'Leverages Flare\'s native FDC for decentralized consensus and tamper-proof verification',
    color: 'text-chart-4',
    gradient: 'from-chart-4 to-chart-4/70',
  },
  {
    icon: Lock,
    title: 'Tamper-Proof',
    description: 'Any modification to verified content is immediately detectable through cryptographic hashes',
    color: 'text-chart-3',
    gradient: 'from-chart-3 to-chart-3/70',
  },
  {
    icon: Database,
    title: 'Multi-AI Support',
    description: 'Works seamlessly with GPT, Gemini, Claude, and other major AI models',
    color: 'text-chart-5',
    gradient: 'from-chart-5 to-chart-5/70',
  },
  {
    icon: CheckCircle,
    title: 'Instant Verification',
    description: 'Real-time validation with automated proof generation in under 3 seconds',
    color: 'text-accent',
    gradient: 'from-accent to-accent/70',
  },
  {
    icon: Globe,
    title: 'Universal Access',
    description: 'Open protocol accessible to developers, enterprises, and individual creators',
    color: 'text-chart-2',
    gradient: 'from-chart-2 to-chart-2/70',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Shield className="mr-2 h-4 w-4" />
              Why Choose VeriAI?
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Revolutionary Features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
              The first and only solution for cryptographically verifying AI content
              using decentralized blockchain technology on Flare Network.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 bg-card/50 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <CardHeader className="text-center pb-4 relative">
                    <motion.div 
                      className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/dashboard">
              <Button size="lg" className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Verifying Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
