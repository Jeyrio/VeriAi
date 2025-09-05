'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity,
  Shield,
  Sparkles,
  Database,
  Store,
  Trophy,
  Clock,
  Filter,
  Search,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'verification' | 'generation' | 'challenge' | 'marketplace' | 'collection';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  details?: {
    transactionHash?: string;
    nftTokenId?: string;
    amount?: number;
    buyer?: string;
    seller?: string;
  };
}

const mockActivities: ActivityItem[] = [
  {
    id: 'act_001',
    type: 'verification',
    title: 'Content Verified Successfully',
    description: 'AI-generated article about blockchain technology verified and minted as NFT',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    details: {
      transactionHash: '0x1234...5678',
      nftTokenId: 'VER_001'
    }
  },
  {
    id: 'act_002',
    type: 'generation',
    title: 'New Content Generated',
    description: 'Created marketing copy using GPT-4 model',
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed'
  },
  {
    id: 'act_003',
    type: 'challenge',
    title: 'Challenge Submitted',
    description: 'Challenged verification VER_045 for technical manipulation',
    timestamp: '2024-01-14T16:20:00Z',
    status: 'pending'
  },
  {
    id: 'act_004',
    type: 'marketplace',
    title: 'NFT Listed for Sale',
    description: 'Listed verification NFT VER_001 on marketplace',
    timestamp: '2024-01-14T14:45:00Z',
    status: 'completed',
    details: {
      amount: 0.5,
      nftTokenId: 'VER_001'
    }
  },
  {
    id: 'act_005',
    type: 'collection',
    title: 'NFT Purchased',
    description: 'Purchased verification NFT from marketplace',
    timestamp: '2024-01-13T11:30:00Z',
    status: 'completed',
    details: {
      amount: 0.3,
      seller: '0xabc...def',
      nftTokenId: 'VER_078'
    }
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'verification': return Shield;
    case 'generation': return Sparkles;
    case 'challenge': return Trophy;
    case 'marketplace': return Store;
    case 'collection': return Database;
    default: return Activity;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'verification': return 'text-green-500';
    case 'generation': return 'text-blue-500';
    case 'challenge': return 'text-yellow-500';
    case 'marketplace': return 'text-purple-500';
    case 'collection': return 'text-cyan-500';
    default: return 'text-gray-500';
  }
};

const getStatusIcon = (status: ActivityItem['status']) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'pending': return Clock;
    case 'failed': return AlertTriangle;
  }
};

const getStatusColor = (status: ActivityItem['status']) => {
  switch (status) {
    case 'completed': return 'text-green-500';
    case 'pending': return 'text-yellow-500';
    case 'failed': return 'text-red-500';
  }
};

export default function ActivityPage() {
  const [activities] = useState<ActivityItem[]>(mockActivities);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>(mockActivities);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterActivities(query, typeFilter, statusFilter);
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    filterActivities(searchQuery, type, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterActivities(searchQuery, typeFilter, status);
  };

  const filterActivities = (search: string, type: string, status: string) => {
    let filtered = activities;

    if (search) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(search.toLowerCase()) ||
        activity.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type !== 'all') {
      filtered = filtered.filter(activity => activity.type === type);
    }

    if (status !== 'all') {
      filtered = filtered.filter(activity => activity.status === status);
    }

    setFilteredActivities(filtered);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Feed</h1>
        <p className="text-muted-foreground">
          Track all your VeriAI activities and transactions
        </p>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
                <SelectItem value="generation">Generation</SelectItem>
                <SelectItem value="challenge">Challenge</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="collection">Collection</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardContent className="p-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No activities found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more activities.'
                  : 'Start using VeriAI to see your activities here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity, index) => {
            const ActivityIcon = getActivityIcon(activity.type);
            const StatusIcon = getStatusIcon(activity.status);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-0 bg-card/50 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Activity Icon */}
                        <div className={`p-3 rounded-full bg-background/50 ${getActivityColor(activity.type)}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{activity.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>

                          {/* Activity Details */}
                          {activity.details && (
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {activity.details.transactionHash && (
                                <button
                                  onClick={() => window.open(`https://coston2.testnet.flarescan.com/tx/${activity.details?.transactionHash}`, '_blank')}
                                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Tx: {activity.details.transactionHash.slice(0, 6)}...{activity.details.transactionHash.slice(-4)}
                                </button>
                              )}
                              {activity.details.nftTokenId && (
                                <span>NFT: {activity.details.nftTokenId}</span>
                              )}
                              {activity.details.amount && (
                                <span>Amount: {activity.details.amount} FLR</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Time */}
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center gap-1">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                          <span className="text-sm font-medium capitalize">{activity.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Load More Activities
          </Button>
        </div>
      )}
    </div>
  );
}