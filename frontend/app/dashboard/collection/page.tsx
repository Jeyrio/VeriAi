'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database,
  Trophy,
  Eye,
  ExternalLink,
  Share,
  Download,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Shield,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/api/client';
import { useVeriAIAuth } from '@/hooks/useVeriAIAuth';

interface NFTMetadata {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  prompt: string;
  model: string;
  verificationDate: string;
  confidence: number;
  transactionHash: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const CollectionPage = () => {
  const { user, isConnected } = useVeriAIAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  const mockNFTs: NFTMetadata[] = [
    {
      id: '1',
      tokenId: '42',
      name: 'VeriAI Certificate #42',
      description: 'Blockchain Technology Article',
      image: '/api/nft/42/image',
      prompt: 'Write a comprehensive article about blockchain technology and its applications',
      model: 'GPT-4',
      verificationDate: '2024-01-15T10:30:00Z',
      confidence: 98.5,
      transactionHash: '0x123...abc',
      rarity: 'legendary'
    },
    {
      id: '2',
      tokenId: '41',
      name: 'VeriAI Certificate #41',
      description: 'Product Description',
      image: '/api/nft/41/image',
      prompt: 'Create an engaging product description for a SaaS platform',
      model: 'Claude-3',
      verificationDate: '2024-01-14T15:45:00Z',
      confidence: 97.2,
      transactionHash: '0x456...def',
      rarity: 'epic'
    },
    {
      id: '3',
      tokenId: '40',
      name: 'VeriAI Certificate #40',
      description: 'Marketing Copy',
      image: '/api/nft/40/image',
      prompt: 'Generate compelling marketing copy for a tech startup',
      model: 'GPT-3.5',
      verificationDate: '2024-01-13T09:20:00Z',
      confidence: 95.8,
      transactionHash: '0x789...ghi',
      rarity: 'rare'
    },
    {
      id: '4',
      tokenId: '39',
      name: 'VeriAI Certificate #39',
      description: 'Email Template',
      image: '/api/nft/39/image',
      prompt: 'Create a professional email template for customer outreach',
      model: 'GPT-4',
      verificationDate: '2024-01-12T14:15:00Z',
      confidence: 96.3,
      transactionHash: '0xabc...xyz',
      rarity: 'common'
    }
  ];

  const [nfts, setNfts] = useState<NFTMetadata[]>(mockNFTs);

  useEffect(() => {
    if (isConnected && user?.walletAddress) {
      loadNFTs();
    } else {
      setNfts(mockNFTs);
    }
  }, [isConnected, user?.walletAddress]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from API using user's wallet address
      // const response = await userApi.getNFTs(user?.walletAddress!);
      // if (response.success && response.data && Array.isArray(response.data)) {
      //   setNfts(response.data);
      // } else {
      //   setNfts(mockNFTs);
      // }
      setNfts(mockNFTs);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setNfts(mockNFTs);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-chart-4 to-chart-4/70';
      case 'epic': return 'from-chart-5 to-chart-5/70';
      case 'rare': return 'from-primary to-accent';
      default: return 'from-chart-3 to-chart-3/70';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-chart-4/30';
      case 'epic': return 'border-chart-5/30';
      case 'rare': return 'border-primary/30';
      default: return 'border-chart-3/30';
    }
  };

  const openTransaction = (hash: string) => {
    window.open(`https://explorer.solana.com/tx/${hash}?cluster=devnet`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">NFT Collection</h1>
          <p className="text-muted-foreground">
            Your verified AI content certificates stored as NFTs
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Collection Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{Array.isArray(nfts) ? nfts.length : 0}</p>
            <p className="text-sm text-muted-foreground">Total NFTs</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-chart-4 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">1</p>
            <p className="text-sm text-muted-foreground">Legendary</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-chart-5 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">1</p>
            <p className="text-sm text-muted-foreground">Epic</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">97.0%</p>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* NFT Collection */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(nfts) ? nfts.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className={`border-2 ${getRarityBorder(nft.rarity)} bg-card/50 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}>
                  {/* NFT Image/Preview */}
                  <div className={`h-48 bg-gradient-to-br ${getRarityColor(nft.rarity)} flex items-center justify-center relative`}>
                    <div className="text-center text-white">
                      <Shield className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-bold">#{nft.tokenId}</p>
                    </div>
                    <Badge className="absolute top-3 right-3 capitalize bg-background/20 backdrop-blur border-white/20">
                      {nft.rarity}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{nft.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline">{nft.model}</Badge>
                        <span className="text-muted-foreground">{nft.confidence.toFixed(1)}%</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : null}
          </div>
        ) : (
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                {Array.isArray(nfts) ? nfts.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(nft.rarity)} flex items-center justify-center shrink-0`}>
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">#{nft.tokenId}</h3>
                        <Badge variant="outline" className="capitalize">{nft.rarity}</Badge>
                        <Badge variant="secondary">{nft.model}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-1">{nft.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(nft.verificationDate).toLocaleDateString()} • {nft.confidence.toFixed(1)}% confidence
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openTransaction(nft.transactionHash)}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                )) : null}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Empty State */}
      {!loading && (!Array.isArray(nfts) || nfts.length === 0) && (
        <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
          <CardContent className="p-12 text-center">
            <Database className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No NFTs Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start generating and verifying AI content to earn NFT certificates.
            </p>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollectionPage;