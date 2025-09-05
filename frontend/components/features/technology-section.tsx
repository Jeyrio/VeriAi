'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

const technologies = [
  {
    name: 'Flare Network',
    description: 'Layer 1 blockchain with native data connectivity',
    url: 'https://flare.network',
    type: 'Blockchain',
    color: 'bg-red-500/10 text-red-700 dark:text-red-300',
  },
  {
    name: 'Data Connector',
    description: 'Decentralized oracle network for external data',
    url: 'https://dev.flare.network/fdc',
    type: 'Oracle',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  {
    name: 'OpenAI API',
    description: 'GPT models for content generation and verification',
    url: 'https://openai.com',
    type: 'AI Model',
    color: 'bg-green-500/10 text-green-700 dark:text-green-300',
  },
  {
    name: 'Google Gemini',
    description: 'Advanced AI model for multimodal understanding',
    url: 'https://ai.google.dev',
    type: 'AI Model',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  },
  {
    name: 'ERC-721',
    description: 'Non-fungible token standard for verification certificates',
    url: 'https://eips.ethereum.org/EIPS/eip-721',
    type: 'Standard',
    color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  },
  {
    name: 'IPFS',
    description: 'Distributed storage for NFT metadata',
    url: 'https://ipfs.io',
    type: 'Storage',
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
];

export function TechnologySection() {
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
              Built on Cutting-Edge Technology
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              VeriAI leverages the best technologies for secure, decentralized AI verification
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{tech.name}</h3>
                          <Badge className={tech.color} variant="secondary">
                            {tech.type}
                          </Badge>
                        </div>
                        <a
                          href={tech.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground text-left">
                        {tech.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground">
              All technologies are production-ready and battle-tested in enterprise environments
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
