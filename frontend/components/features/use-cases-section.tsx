'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, GraduationCap, FileText, Camera, Code } from 'lucide-react';

const useCases = [
  {
    icon: Building2,
    title: 'Enterprise AI',
    description: 'Verify business reports, analysis, and automated content generation',
    examples: ['Financial Reports', 'Market Analysis', 'Content Creation'],
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  {
    icon: GraduationCap,
    title: 'Academic Research',
    description: 'Authenticate AI-assisted research papers and academic content',
    examples: ['Research Papers', 'Data Analysis', 'Literature Reviews'],
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  },
  {
    icon: FileText,
    title: 'Legal Documentation',
    description: 'Provide evidence for AI-generated content in legal proceedings',
    examples: ['Legal Briefs', 'Contract Analysis', 'Evidence Chain'],
    color: 'bg-green-500/10 text-green-700 dark:text-green-300',
  },
  {
    icon: Camera,
    title: 'Creative Industries',
    description: 'Protect intellectual property of AI-generated creative works',
    examples: ['Art Descriptions', 'Story Concepts', 'Brand Content'],
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  },
  {
    icon: Code,
    title: 'Developer Tools',
    description: 'Integrate verification into applications and platforms',
    examples: ['API Integration', 'Automated Workflows', 'User Verification'],
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  },
  {
    icon: Users,
    title: 'Social Media',
    description: 'Combat misinformation with verified AI content markers',
    examples: ['Content Labels', 'Fact Checking', 'Source Attribution'],
    color: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 lg:py-32">
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
              Use Cases
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl">
              VeriAI serves diverse industries requiring AI content authenticity
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="space-y-4">
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg ${useCase.color}`}>
                      <useCase.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                      <CardDescription>{useCase.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Examples:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {useCase.examples.map((example) => (
                          <Badge key={example} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
