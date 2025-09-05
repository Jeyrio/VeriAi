'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Users,
  Shield,
  Zap,
  Trophy,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/api/client';
import { useAccount } from 'wagmi';

const AnalyticsPage = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState([
    { title: 'Total Verifications', value: '0', change: '+0%', icon: BarChart3, color: 'text-primary' },
    { title: 'Success Rate', value: '0%', change: '+0%', icon: CheckCircle, color: 'text-chart-3' },
    { title: 'Active Users', value: '0', change: '+0%', icon: Users, color: 'text-chart-5' },
    { title: 'Network Health', value: '0%', change: '+0%', icon: Activity, color: 'text-accent' },
  ]);

  const [modelStats, setModelStats] = useState([
    { model: 'GPT-4', requests: 0, success: 0, avgTime: '0s', color: 'from-primary to-primary/70' },
    { model: 'Claude-3', requests: 0, success: 0, avgTime: '0s', color: 'from-chart-5 to-chart-5/70' },
    { model: 'GPT-3.5', requests: 0, success: 0, avgTime: '0s', color: 'from-chart-3 to-chart-3/70' },
    { model: 'Gemini', requests: 0, success: 0, avgTime: '0s', color: 'from-chart-4 to-chart-4/70' },
  ]);

  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      loadAnalyticsData();
    }
  }, [isConnected, address]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await userApi.getStats(address!);
      if (response.success && response.data) {
        const data = response.data;
        setGlobalStats([
          { title: 'Total Verifications', value: data.totalVerifications?.toString() || '0', change: `+${data.verificationsChange || 0}%`, icon: BarChart3, color: 'text-primary' },
          { title: 'Success Rate', value: `${data.successRate || 0}%`, change: `+${data.successRateChange || 0}%`, icon: CheckCircle, color: 'text-chart-3' },
          { title: 'NFTs Minted', value: data.totalNFTs?.toString() || '0', change: `+${data.nftsChange || 0}%`, icon: Users, color: 'text-chart-5' },
          { title: 'Active Today', value: data.activeToday?.toString() || '0', change: `+${data.activeChange || 0}%`, icon: Activity, color: 'text-accent' },
        ]);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into AI verification trends and performance
        </p>
      </motion.div>

      {/* Global Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {globalStats.map((stat, index) => (
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
                      {stat.change} vs last month
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verification Trends */}
            <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Verification Trends
                </CardTitle>
                <CardDescription>Daily verification volume over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted mx-auto mb-4" />
                    <p className="text-lg font-medium">Chart Visualization</p>
                    <p className="text-sm">Interactive charts would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Network Status
                </CardTitle>
                <CardDescription>Flare network performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">FDC Status</span>
                  <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Response Time</span>
                  <span className="text-sm font-semibold">1.2s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm font-semibold text-chart-3">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Validators</span>
                  <span className="text-sm font-semibold">847</span>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="h-3 w-3 mr-2" />
                    View Network Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI Model Performance
              </CardTitle>
              <CardDescription>Verification statistics by AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelStats.map((model, index) => (
                  <motion.div
                    key={model.model}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-background/50 rounded-xl border border-border/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center shadow-lg`}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{model.model}</h3>
                        <p className="text-sm text-muted-foreground">
                          {model.requests.toLocaleString()} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-chart-3">{model.success}%</p>
                      <p className="text-sm text-muted-foreground">{model.avgTime}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Verifications
                  </CardTitle>
                  <CardDescription>Latest verification requests across the network</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVerifications.map((verification, index) => (
                  <motion.div
                    key={verification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        verification.status === 'verified' ? 'bg-chart-3' :
                        verification.status === 'processing' ? 'bg-chart-4' :
                        'bg-destructive'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1 text-foreground">{verification.prompt}</p>
                        <p className="text-xs text-muted-foreground">{verification.model} • {verification.time}</p>
                      </div>
                    </div>
                    <Badge variant={
                      verification.status === 'verified' ? 'default' :
                      verification.status === 'processing' ? 'secondary' :
                      'destructive'
                    }>
                      {verification.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {verification.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                      {verification.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {verification.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Analytics Reports
                  </CardTitle>
                  <CardDescription>Generate and download detailed analytics reports</CardDescription>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-6 bg-background/50 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-chart-4 to-chart-4/70 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">Performance Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed performance metrics and trends
                  </p>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-6 bg-background/50 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">Security Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Verification integrity and security analysis
                  </p>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-6 bg-background/50 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-chart-3 to-chart-3/70 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-foreground">Usage Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Usage patterns and optimization insights
                  </p>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;