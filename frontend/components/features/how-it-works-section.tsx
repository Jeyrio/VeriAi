'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Shield, Award } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Submit Content',
    description: 'Enter your AI prompt and select the model used for generation',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    icon: Shield,
    title: 'FDC Verification',
    description: 'Flare Data Connector validates output through decentralized consensus',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    icon: Award,
    title: 'Mint Certificate',
    description: 'Receive an immutable NFT proving your content\'s authenticity',
    color: 'from-green-500 to-emerald-500',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Three simple steps to cryptographically verify your AI content
            </p>
          </motion.div>

          <div className="mt-16 space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="group overflow-hidden border-2 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className={`grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 ${
                      index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                    }`}>
                      {/* Content */}
                      <div className={`space-y-6 ${
                        index % 2 === 1 ? 'lg:col-start-2' : ''
                      }`}>
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            Step {step.number}
                          </div>
                          <h3 className="text-2xl font-bold">{step.title}</h3>
                          <p className="text-lg text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                        
                        {index === steps.length - 1 && (
                          <Button className="group">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        )}
                      </div>

                      {/* Visual */}
                      <div className={`flex items-center justify-center ${
                        index % 2 === 1 ? 'lg:col-start-1' : ''
                      }`}>
                        <div className={`relative h-32 w-32 rounded-full bg-gradient-to-br ${step.color} p-8 shadow-2xl`}>
                          <step.icon className="h-full w-full text-white" />
                          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background font-bold text-sm shadow-lg">
                            {step.number}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow connector */}
                    {index < steps.length - 1 && (
                      <div className="mt-8 flex justify-center">
                        <ArrowRight className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
