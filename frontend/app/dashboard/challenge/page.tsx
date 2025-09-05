'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield, 
  Upload,
  Eye,
  EyeOff,
  Copy,
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVerificationWebSocket } from '@/lib/hooks/useWebSocket';
import { useWalletActions } from '@/lib/contexts/WalletContext';
import { verificationApi } from '@/lib/api/client';
import { APP_CONFIG } from '@/lib/config';
import { toast } from 'sonner';

interface VerificationProgress {
  step: number;
  total: number;
  currentStep: string;
  message: string;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  fdcAttestationId?: string;
  blockNumber?: number;
  transactionHash?: string;
  nftTokenId?: string;
}

export default function ChallengeSystemPage() {
  const { requireWallet, address } = useWalletActions();
  const [verificationId, setVerificationId] = useState('');
  const [challengeReason, setChallengeReason] = useState('');
  const [challengeEvidence, setChallengeEvidence] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const { status, updates } = useVerificationWebSocket(verificationId);

  const handleSubmitChallenge = async () => {
    if (!requireWallet('submit a challenge')) return;
    if (!verificationId || !challengeReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare evidence data
      const evidence = {
        reason: challengeReason,
        description: challengeEvidence,
        files: selectedFiles ? Array.from(selectedFiles).map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })) : [],
        timestamp: new Date().toISOString(),
        challenger: address
      };

      // Submit challenge
      const response = await fetch(`${APP_CONFIG.api.baseUrl}/api/v1/verification/${verificationId}/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengerAddress: address,
          reason: challengeReason,
          evidence
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Challenge submitted successfully!', {
          description: 'Your challenge has been recorded and will be reviewed.',
        });
        
        // Reset form
        setVerificationId('');
        setChallengeReason('');
        setChallengeEvidence('');
        setSelectedFiles(null);
      } else {
        throw new Error(data.error || 'Failed to submit challenge');
      }
    } catch (error) {
      console.error('Challenge submission error:', error);
      toast.error('Failed to submit challenge', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const openInExplorer = (hash: string) => {
    window.open(`${APP_CONFIG.blockchain.explorerUrl}/tx/${hash}`, '_blank');
  };

  const challengeReasons = [
    'Incorrect AI output verification',
    'Falsified generation metadata',
    'Invalid FDC attestation',
    'Plagiarized content',
    'Technical manipulation',
    'Other (please specify)'
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Challenge System</h1>
        <p className="text-muted-foreground">
          Challenge questionable AI content verifications to maintain system integrity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Challenge Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-chart-4" />
                Submit Challenge
              </CardTitle>
              <CardDescription>
                Challenge a verification that you believe is incorrect or fraudulent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification ID */}
              <div>
                <Label htmlFor="verificationId">Verification ID *</Label>
                <Input
                  id="verificationId"
                  placeholder="Enter the verification ID to challenge"
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can find this in the verification details or URL
                </p>
              </div>

              {/* Challenge Reason */}
              <div>
                <Label className="text-base font-medium">Challenge Reason *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {challengeReasons.map((reason) => (
                    <div
                      key={reason}
                      onClick={() => setChallengeReason(reason)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        challengeReason === reason
                          ? 'border-chart-4 bg-chart-4/10'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <span className="text-sm font-medium">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Description */}
              <div>
                <Label htmlFor="evidence">Detailed Evidence</Label>
                <Textarea
                  id="evidence"
                  placeholder="Provide detailed evidence supporting your challenge..."
                  value={challengeEvidence}
                  onChange={(e) => setChallengeEvidence(e.target.value)}
                  className="min-h-32 mt-2"
                  maxLength={2000}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Be specific and provide clear reasoning</span>
                  <span>{challengeEvidence.length}/2000</span>
                </div>
              </div>

              {/* File Evidence */}
              <div>
                <Label htmlFor="files">Supporting Files (Optional)</Label>
                <div className="mt-2">
                  <input
                    id="files"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('files')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Supporting Files
                  </Button>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max 10 files, 50MB total. Supported: PDF, images, documents
                </p>
              </div>

              {/* Challenge Warning */}
              <div className="bg-chart-4/10 border border-chart-4/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-chart-4" />
                  <span className="font-medium text-chart-4">Important Notice</span>
                </div>
                <p className="text-sm text-foreground">
                  False challenges may result in penalties. Only submit challenges with valid evidence.
                  All challenges are publicly viewable and become part of the verification record.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitChallenge}
                disabled={isSubmitting || !verificationId || !challengeReason}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting Challenge...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Submit Challenge
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Status & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Real-time Status */}
          {verificationId && (
            <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Status
                </CardTitle>
                <CardDescription>
                  Real-time status of verification {verificationId.slice(0, 8)}...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={
                      status === 'verified' ? 'default' :
                      status === 'challenged' ? 'destructive' :
                      status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {status}
                    </Badge>
                  </div>
                  
                  {updates.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Recent Updates</span>
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                        {updates.slice(-3).map((update, index) => (
                          <div key={index} className="text-xs p-2 bg-muted/50 rounded">
                            <div className="font-medium">{update.message}</div>
                            <div className="text-muted-foreground">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Challenge Guidelines */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Challenge Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium">Valid Challenges Include:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                    <li>Incorrect AI model verification</li>
                    <li>Manipulated output data</li>
                    <li>Invalid FDC attestations</li>
                    <li>Technical fraud evidence</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Required Evidence:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                    <li>Detailed technical explanation</li>
                    <li>Supporting documentation</li>
                    <li>Reproducible proof</li>
                    <li>Expert verification (optional)</li>
                  </ul>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3 w-3 mr-2" />
                Read Full Guidelines
              </Button>
            </CardContent>
          </Card>

          {/* Challenge Statistics */}
          <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle>Challenge Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Challenges</span>
                  <span className="font-medium">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Upheld</span>
                  <span className="font-medium text-chart-3">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rejected</span>
                  <span className="font-medium text-chart-5">38</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">70.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Challenges */}
      <Card className="border-0 bg-card/50 backdrop-blur shadow-lg">
        <CardHeader>
          <CardTitle>Recent Challenges</CardTitle>
          <CardDescription>
            Recent challenges submitted to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Challenge #{`CHG_${1000 + index}`}</span>
                    <Badge variant="secondary">Under Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Verification ID: VER_abc123... • Reason: Technical manipulation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}