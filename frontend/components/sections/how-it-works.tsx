'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Shield, 
  Database, 
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  Trophy
} from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Generate AI Content',
    description: 'Create content using your preferred AI model (GPT, Claude, Gemini)',
    icon: Sparkles,
    color: 'from-primary to-accent',
    details: ['Choose your AI model', 'Input your prompt', 'Generate high-quality content']
  },
  {
    step: 2,
    title: 'Request Verification',
    description: 'Submit your content for cryptographic verification on Flare',
    icon: Shield,
    color: 'from-chart-3 to-chart-3/70',
    details: ['Submit content & prompt', 'Pay verification fee', 'Flare Data Connector processes']
  },
  {
    step: 3,
    title: 'Blockchain Proof',
    description: 'Receive immutable proof stored permanently on-chain',
    icon: Lock,
    color: 'from-chart-5 to-chart-5/70',
    details: ['Cryptographic hash generated', 'Stored on Flare blockchain', 'Tamper-proof certificate']
  },
  {
    step: 4,
    title: 'NFT Certificate',
    description: 'Get your verification certificate as a tradeable NFT',
    icon: Trophy,
    color: 'from-chart-4 to-chart-4/70',
    details: ['Mint verification NFT', 'Trade on marketplace', 'Prove authenticity forever']
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary mb-4">
              <Zap className="mr-2 h-4 w-4" />
              How It Works
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Simple 4-Step Process
              </span>
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
              Transform your AI content into verifiable, immutable certificates 
              using Flare's decentralized infrastructure.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 bg-card/50 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-start space-x-4">
                      {/* Step Number & Icon */}
                      <div className="shrink-0">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-4`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <step.icon className="h-8 w-8 text-white" />
                        </motion.div>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-primary">0{step.step}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {step.description}
                        </p>
                        
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-center text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-chart-3 mr-2 shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-chart-5/10 rounded-2xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Verify Your AI Content?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of creators, developers, and enterprises using VeriAI 
                to establish trust in their AI-generated content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Verifying
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <Button variant="outline" size="lg">
                  View Documentation
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}