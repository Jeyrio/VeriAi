'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  Search,
  History,
  Zap,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { verificationApi, VerificationResult } from '@/lib/api/client';

const VerifyPage = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const searchParams = useSearchParams();
  const [content, setContent] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadVerificationHistory();
      
      // Check if we have a specific verification to load
      const requestId = searchParams.get('request');
      if (requestId) {
        loadSpecificVerification(requestId);
      }
    } else {
      setVerificationHistory([]);
    }
  }, [isConnected, address, searchParams]);

  const loadVerificationHistory = async () => {
    setLoading(true);
    try {
      const response = await verificationApi.getUserVerifications(address!);
      if (response.success && response.data && Array.isArray(response.data.verifications)) {
        setVerificationHistory(response.data.verifications);
      } else {
        setVerificationHistory([]);
      }
    } catch (error) {
      console.error('Error loading verification history:', error);
      setVerificationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificVerification = async (verificationId: string) => {
    try {
      const response = await verificationApi.getVerification(verificationId);
      if (response.success && response.data) {
        setVerificationResult(response.data);
        // Also reload history to include the new verification
        await loadVerificationHistory();
      }
    } catch (error) {
      console.error('Error loading specific verification:', error);
    }
  };

  const handleVerify = async () => {
    if (!content.trim() || !isConnected || !address) return;

    setIsVerifying(true);
    try {
      // Create content hash
      const contentHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content.trim()));
      const outputHash = Array.from(new Uint8Array(contentHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Create message to sign
      const message = `Verify AI content with hash: ${outputHash}\nTimestamp: ${Date.now()}`;

      // Request wallet signature
      const signature = await signMessageAsync({ message });

      const response = await verificationApi.requestVerification({
        prompt: 'Verify this content',
        model: 'gemini-1.5-flash',
        userAddress: address,
        output: content.trim(),
        outputHash,
        signature,
        message
      });

      if (response.success && response.data) {
        setVerificationResult(response.data);
        setVerificationHistory(prev => [response.data!, ...(Array.isArray(prev) ? prev : [])]);
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const fallbackResult: VerificationResult = {
        id: 'error',
        status: 'failed',
        requestId: 'error',
        userAddress: address!,
        prompt: 'Verify this content',
        model: 'gemini-1.5-flash',
        output: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setVerificationResult(fallbackResult);
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openTransaction = (hash: string) => {
    window.open(`https://coston2.testnet.flarescan.com/tx/${hash}`, '_blank');
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
        <h1 className="text-3xl font-bold text-foreground">Content Verification</h1>
        <p className="text-muted-foreground">
          Verify the authenticity of AI-generated content using blockchain technology
        </p>
      </motion.div>

      <Tabs defaultValue="verify" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verify Content
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Verification Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verify AI Content
                  </CardTitle>
                  <CardDescription>
                    Paste AI-generated content to check its authenticity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Input */}
                  <div>
                    <Label htmlFor="content" className="text-base font-medium">Content to Verify</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste the AI-generated content you want to verify..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-48 mt-2"
                      maxLength={5000}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Supports text up to 5000 characters</span>
                      <span>{content.length}/5000</span>
                    </div>
                  </div>

                  {/* Upload Option */}
                  <div className="border-t pt-6">
                    <Label className="text-base font-medium">Or Upload File</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop a text file here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports .txt, .md, .doc files
                      </p>
                    </div>
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || !content.trim()}
                    className="w-full group"
                    size="lg"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        Verify Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Verification Result */}
            <div className="lg:col-span-1">
              <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Verification Result
                  </CardTitle>
                  <CardDescription>
                    Analysis results will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!verificationResult && !isVerifying && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-16 w-16 text-muted mx-auto mb-4" />
                      <p>Enter content to verify its authenticity</p>
                    </div>
                  )}

                  {isVerifying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-foreground mb-2">Analyzing content...</p>
                      <p className="text-sm text-muted-foreground">Checking against blockchain records</p>
                    </motion.div>
                  )}

                  {verificationResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Status */}
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                          verificationResult.status === 'completed' ? 'bg-chart-3/10' :
                          verificationResult.status === 'failed' ? 'bg-destructive/10' :
                          'bg-chart-4/10'
                        }`}>
                          {verificationResult.status === 'completed' && <CheckCircle className="h-8 w-8 text-chart-3" />}
                          {verificationResult.status === 'failed' && <AlertTriangle className="h-8 w-8 text-destructive" />}
                          {verificationResult.status === 'pending' && <Clock className="h-8 w-8 text-chart-4" />}
                        </div>
                        
                        <Badge variant={
                          verificationResult.status === 'completed' ? 'default' :
                          verificationResult.status === 'failed' ? 'destructive' :
                          'secondary'
                        } className="mb-2">
                          {verificationResult.status}
                        </Badge>
                        
                        <p className="text-2xl font-bold text-foreground">
                          {(verificationResult.confidence || 0).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Confidence Score</p>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Model</span>
                          <Badge variant="outline">{verificationResult.model}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Verified</span>
                          <span className="text-sm">{new Date(verificationResult.createdAt).toLocaleString()}</span>
                        </div>
                        {verificationResult.transactionHash && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Transaction</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTransaction(verificationResult.transactionHash!)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {verificationResult.fdcAttestationId && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Attestation ID</span>
                            <span className="text-sm font-mono">{verificationResult.fdcAttestationId}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {verificationResult.status === 'completed' && (
                        <div className="space-y-2 pt-4 border-t">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => copyToClipboard(verificationResult.id)}>
                            <Copy className="h-3 w-3 mr-2" />
                            Copy Verification ID
                          </Button>
                          {verificationResult.fdcAttestationId && (
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-3 w-3 mr-2" />
                              View Attestation
                            </Button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Verifications
              </CardTitle>
              <CardDescription>
                Search for verified content by prompt, model, or verification ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-16 w-16 text-muted mx-auto mb-4" />
                <p className="text-lg font-medium">Search Functionality</p>
                <p className="text-sm">Advanced search features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-8">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Verification History
              </CardTitle>
              <CardDescription>Your recent verification requests and results</CardDescription>
            </CardHeader>
            <CardContent>
              {verificationHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-16 w-16 text-muted mx-auto mb-4" />
                  <p>No verification history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verificationHistory.map((verification, index) => (
                    <motion.div
                      key={verification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-background/50 rounded-lg border border-border/50 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              verification.status === 'completed' ? 'default' :
                              verification.status === 'failed' ? 'destructive' :
                              'secondary'
                            }>
                              {verification.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {verification.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {verification.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {verification.status}
                            </Badge>
                            <Badge variant="outline">{verification.model}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {(verification.confidence || 0).toFixed(1)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {verification.prompt}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(verification.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-3 mb-3">
                        <p className="text-sm line-clamp-3 text-foreground">
                          {verification.output}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setVerificationResult(verification)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        {verification.transactionHash && (
                          <Button variant="outline" size="sm" onClick={() => openTransaction(verification.transactionHash!)}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Transaction
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VerifyPage;