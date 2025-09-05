'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check,
  Zap,
  Shield,
  Crown,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Database,
  Trophy,
  DollarSign
} from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    price: '0.01',
    currency: 'FLR',
    period: 'per verification',
    icon: Zap,
    color: 'from-chart-3 to-chart-3/70',
    features: [
      'Up to 10 verifications/day',
      'Basic AI models support',
      'Standard verification speed',
      'NFT certificates included',
      'Community support'
    ],
    popular: false
  },
  {
    name: 'Professional',
    description: 'For content creators and developers',
    price: '5.0',
    currency: 'FLR',
    period: 'monthly unlimited',
    icon: Shield,
    color: 'from-primary to-accent',
    features: [
      'Unlimited verifications',
      'All AI models supported',
      'Priority verification speed',
      'Advanced analytics dashboard',
      'API access included',
      'Premium support'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'For businesses and large organizations',
    price: 'Custom',
    currency: '',
    period: 'contact sales',
    icon: Building,
    color: 'from-chart-5 to-chart-5/70',
    features: [
      'Custom verification limits',
      'Dedicated infrastructure',
      'SLA guarantees',
      'White-label solutions',
      'Custom integrations',
      'Dedicated support team',
      'Compliance reporting'
    ],
    popular: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-primary/5">
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
              <DollarSign className="mr-2 h-4 w-4" />
              Transparent Pricing
            </div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
              Flexible pricing options for individuals, creators, and enterprises. 
              Pay only for what you use with transparent blockchain fees.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1 shadow-lg">
                      <Crown className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full border-2 ${plan.popular ? 'border-primary/50 shadow-2xl' : 'border-border'} bg-card/50 backdrop-blur hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <CardHeader className="text-center pb-4 relative">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg mx-auto mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <plan.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    <CardTitle className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </CardTitle>
                    <p className="text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                        {plan.currency && (
                          <span className="text-lg font-medium text-muted-foreground ml-1">{plan.currency}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.period}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-8">
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.2 + i * 0.1 }}
                          viewport={{ once: true }}
                          className="flex items-start"
                        >
                          <CheckCircle className="h-5 w-5 text-chart-3 mr-3 mt-0.5 shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full group ${plan.popular ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.name === 'Enterprise' ? (
                        <>
                          Contact Sales
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-muted/50 to-accent/10 rounded-xl p-6 border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                All plans include
              </h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-chart-3" />
                  Blockchain security
                </span>
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-primary" />
                  Flare Data Connector
                </span>
                <span className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-chart-4" />
                  NFT certificates
                </span>
                <span className="flex items-center">
                  <Database className="h-4 w-4 mr-1 text-accent" />
                  Immutable storage
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}