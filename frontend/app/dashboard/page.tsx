'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Shield, 
  Trophy,
  BarChart3,
  ArrowRight,
  Activity,
  Store,
  Database,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/lib/config';
import { userApi } from '@/lib/api/client';

const DashboardPage = () => {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState([
    { title: 'Total Verifications', value: '0', change: '+0%', icon: BarChart3, color: 'text-primary' },
    { title: 'Success Rate', value: '0%', change: '+0%', icon: CheckCircle, color: 'text-chart-3' },
    { title: 'NFTs Minted', value: '0', change: '+0%', icon: Trophy, color: 'text-chart-5' },
    { title: 'Active Today', value: '0', change: '+0%', icon: Activity, color: 'text-accent' },
  ]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const quickActions = [
    {
      title: 'Generate Content',
      description: 'Create AI content with verification',
      icon: Sparkles,
      href: '/dashboard/generate',
      color: 'from-primary to-accent',
    },
    {
      title: 'Verify Content',
      description: 'Verify existing AI content',
      icon: Shield,
      href: '/dashboard/verify',
      color: 'from-chart-3 to-chart-3/70',
    },
    {
      title: 'View Collection',
      description: 'Browse your NFT certificates',
      icon: Database,
      href: '/dashboard/collection',
      color: 'from-chart-5 to-chart-5/70',
    },
    {
      title: 'Marketplace',
      description: 'Trade verification NFTs',
      icon: Store,
      href: '/dashboard/marketplace',
      color: 'from-chart-2 to-chart-2/70',
    },
  ];

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        userApi.getStats(address!),
        userApi.getGenerations(address!)
      ]);

      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
        setStats([
          { title: 'Total Verifications', value: data.totalVerifications?.toString() || '0', change: `+${data.verificationsChange || 0}%`, icon: BarChart3, color: 'text-primary' },
          { title: 'Success Rate', value: `${data.successRate || 0}%`, change: `+${data.successRateChange || 0}%`, icon: CheckCircle, color: 'text-chart-3' },
          { title: 'NFTs Minted', value: data.totalNFTs?.toString() || '0', change: `+${data.nftsChange || 0}%`, icon: Trophy, color: 'text-chart-5' },
          { title: 'Active Today', value: data.activeToday?.toString() || '0', change: `+${data.activeChange || 0}%`, icon: Activity, color: 'text-accent' },
        ]);
      }

      if (activityResponse.success && activityResponse.data) {
        const generations = activityResponse.data.generations || [];
        const activityData = generations.slice(0, 4).map((gen: any, i: number) => ({
          id: gen.id || `${i}`,
          type: 'generation',
          title: 'Content Generated',
          model: gen.model || 'Unknown',
          time: gen.createdAt ? new Date(gen.createdAt).toLocaleString() : 'Unknown',
          status: gen.status || 'completed'
        }));
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your AI verifications today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-chart-3' : 'text-destructive'}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href={action.href}>
                <Card className="h-full border-0 bg-card/50 backdrop-blur shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <CardContent className="p-6 relative">
                    <div className="space-y-4">
                      <motion.div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <action.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">Get started</span>
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Recent Activity</h2>
          <Link href="/dashboard/activity">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {loading ? (
                Array.from({length: 4}).map((_, index) => (
                  <div key={index} className="animate-pulse p-4 bg-background/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-1" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="w-16 h-6 bg-muted rounded" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-16 w-16 text-muted mx-auto mb-4" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity: any, index: number) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                        activity.type === 'verification' ? 'from-primary to-accent' :
                        activity.type === 'generation' ? 'from-chart-4 to-chart-4/70' :
                        'from-chart-5 to-chart-5/70'
                      } flex items-center justify-center`}>
                        {activity.type === 'verification' && <Shield className="h-4 w-4 text-white" />}
                        {activity.type === 'generation' && <Sparkles className="h-4 w-4 text-white" />}
                        {activity.type === 'nft' && <Trophy className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.model} • {activity.time}</p>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                      {activity.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {activity.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                      {activity.status}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
