'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store,
  TrendingUp,
  Trophy,
  ShoppingCart,
  Heart,
  Eye,
  DollarSign,
  Filter,
  Search,
  Grid3X3,
  List,
  Flame,
  Crown,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userApi } from '@/lib/api/client';
import { useVeriAIAuth } from '@/hooks/useVeriAIAuth';
import { VeriAISolanaPayWidget } from '@/components/solana-pay/veriAISolanaPayWidget';

interface MarketplaceNFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string;
  currency: string;
  seller: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  model: string;
  confidence: number;
  likes: number;
  views: number;
  isHot?: boolean;
}

const MarketplacePage = () => {
  const { user, isConnected } = useVeriAIAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('browse');
  const [marketplaceNFTs, setMarketplaceNFTs] = useState<MarketplaceNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<MarketplaceNFT | null>(null);
  const [showSolanaPayModal, setShowSolanaPayModal] = useState(false);

  const marketplaceStats = [
    { title: 'Items Listed', value: '2,847', change: '+156', icon: Store, color: 'text-primary' },
    { title: 'Volume (24h)', value: '89.2 SOL', change: '+12.5%', icon: TrendingUp, color: 'text-chart-3' },
    { title: 'Floor Price', value: '0.5 SOL', change: '+5.2%', icon: DollarSign, color: 'text-chart-4' },
    { title: 'Active Traders', value: '1,247', change: '+8.3%', icon: Trophy, color: 'text-chart-5' },
  ];

  const featuredNFTs: MarketplaceNFT[] = [
    {
      id: '1',
      tokenId: '156',
      name: 'AI Research Paper',
      description: 'Comprehensive analysis of machine learning algorithms',
      image: '/api/nft/156/image',
      price: '5.2',
      currency: 'SOL',
      seller: 'Do4L8vNFaMVprieuSbftTrx98sVgjz7EXKeH3gXpQw2P',
      rarity: 'legendary',
      model: 'GPT-4',
      confidence: 99.2,
      likes: 87,
      views: 456,
      isHot: true
    },
    {
      id: '2',
      tokenId: '155',
      name: 'Creative Writing Piece',
      description: 'Original short story with unique narrative style',
      image: '/api/nft/155/image',
      price: '2.8',
      currency: 'SOL',
      seller: '0x123d...4B56',
      rarity: 'epic',
      model: 'Claude-3',
      confidence: 98.7,
      likes: 43,
      views: 234
    },
    {
      id: '3',
      tokenId: '154',
      name: 'Technical Documentation',
      description: 'Complete API documentation with examples',
      image: '/api/nft/154/image',
      price: '1.5',
      currency: 'SOL',
      seller: '0x789d...8C90',
      rarity: 'rare',
      model: 'GPT-3.5',
      confidence: 97.1,
      likes: 29,
      views: 178
    },
    {
      id: '4',
      tokenId: '153',
      name: 'Marketing Strategy',
      description: 'Comprehensive go-to-market strategy document',
      image: '/api/nft/153/image',
      price: '3.1',
      currency: 'SOL',
      seller: '0xabc1...2D34',
      rarity: 'epic',
      model: 'GPT-4',
      confidence: 98.9,
      likes: 62,
      views: 312
    }
  ];

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from API
      if (isConnected && user?.walletAddress) {
        // const response = await userApi.getMarketplaceNFTs();
        // if (response.success) {
        //   setMarketplaceNFTs(response.data);
        // } else {
        //   setMarketplaceNFTs(featuredNFTs);
        // }
        setMarketplaceNFTs(featuredNFTs);
      } else {
        setMarketplaceNFTs(featuredNFTs);
      }
    } catch (error) {
      console.error('Error loading marketplace data:', error);
      setMarketplaceNFTs(featuredNFTs);
    } finally {
      setLoading(false);
    }
  };

  // Handle NFT purchase
  const handleBuyNFT = (nft: MarketplaceNFT) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setSelectedNFT(nft);
    setShowSolanaPayModal(true);
  };

  const handlePaymentComplete = (paymentData: any) => {
    console.log('Payment completed:', paymentData);
    setShowSolanaPayModal(false);
    setSelectedNFT(null);
    // In production, update NFT ownership, remove from marketplace, etc.
    alert(`Successfully purchased ${paymentData.nft?.name}!`);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-chart-4 to-chart-4/70';
      case 'epic': return 'from-chart-5 to-chart-5/70';
      case 'rare': return 'from-primary to-accent';
      default: return 'from-chart-3 to-chart-3/70';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return Crown;
      case 'epic': return Flame;
      case 'rare': return Zap;
      default: return Trophy;
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
        <h1 className="text-3xl font-bold text-foreground">NFT Marketplace</h1>
        <p className="text-muted-foreground">
          Trade verified AI-generated content as unique NFT certificates
        </p>
      </motion.div>

      {/* Marketplace Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {marketplaceStats.map((stat, index) => (
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
                      {stat.change} from yesterday
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-8">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
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

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketplaceNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="border-0 bg-card/50 backdrop-blur shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  {/* NFT Preview */}
                  <div className={`h-48 bg-gradient-to-br ${getRarityColor(nft.rarity)} flex items-center justify-center relative`}>
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur">
                        {React.createElement(getRarityIcon(nft.rarity), { className: "h-8 w-8" })}
                      </div>
                      <p className="font-bold">#{nft.tokenId}</p>
                    </div>
                    
                    {nft.isHot && (
                      <Badge className="absolute top-3 left-3 bg-destructive/90 backdrop-blur border-destructive/20">
                        🔥 Hot
                      </Badge>
                    )}
                    
                    <Badge className="absolute top-3 right-3 capitalize bg-background/20 backdrop-blur border-white/20">
                      {nft.rarity}
                    </Badge>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/20 backdrop-blur border-white/20 hover:bg-background/30"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{nft.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{nft.model}</Badge>
                          <span className="text-xs text-muted-foreground">{nft.confidence.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {nft.views}
                          <Heart className="h-3 w-3 ml-2" />
                          {nft.likes}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className="text-lg font-bold text-foreground">{nft.price} {nft.currency}</p>
                          <p className="text-xs text-muted-foreground">by {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</p>
                        </div>
                        <Button 
                          size="sm" 
                          className="group"
                          onClick={() => handleBuyNFT(nft)}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform" />
                          Buy with SOL
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardContent className="p-12 text-center">
              <Crown className="h-16 w-16 text-chart-4 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Featured Collections</h3>
              <p className="text-muted-foreground mb-6">
                Curated selection of the highest quality verified AI content
              </p>
              <Button variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardContent className="p-12 text-center">
              <Flame className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">Trending Now</h3>
              <p className="text-muted-foreground mb-6">
                Most popular and actively traded verification certificates
              </p>
              <Button variant="outline">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Solana Pay Modal */}
      {showSolanaPayModal && selectedNFT && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md"
          >
            <VeriAISolanaPayWidget
              mode="purchase"
              nft={{
                id: selectedNFT.id,
                name: selectedNFT.name,
                price: selectedNFT.price,
                seller: selectedNFT.seller,
                description: selectedNFT.description,
              }}
              onPaymentComplete={handlePaymentComplete}
              onError={handlePaymentError}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;