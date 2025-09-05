"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createQR, encodeURL } from "@solana/pay";
import { Keypair, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useVeriAIAuth } from "@/hooks/useVeriAIAuth";
import { useWeb3AuthMultichain } from "@/hooks/use-web3auth-multichain";
import { QrCode, CreditCard, Zap, AlertCircle, ShoppingCart, Eye, Share } from "lucide-react";

interface NFTPaymentRequest {
  recipient: string;
  amount: number;
  label: string;
  message: string;
  memo: string;
  nftId?: string;
  nftName?: string;
}

interface VeriAISolanaPayWidgetProps {
  // NFT Purchase Mode
  mode?: 'purchase' | 'generator';
  nft?: {
    id: string;
    name: string;
    price: string;
    seller: string;
    description?: string;
  };
  // Custom payment
  onPaymentComplete?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

export function VeriAISolanaPayWidget({ 
  mode = 'generator', 
  nft,
  onPaymentComplete,
  onError 
}: VeriAISolanaPayWidgetProps) {
  const { isConnected } = useVeriAIAuth();
  const { solana } = useWeb3AuthMultichain();
  const walletAddress = solana.address;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountToSend, setAmountToSend] = useState(nft ? parseFloat(nft.price) : 0);
  const [showModal, setShowModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [paymentType, setPaymentType] = useState<'nft-purchase' | 'verification-payment' | 'custom-payment'>(
    mode === 'purchase' ? 'nft-purchase' : 'verification-payment'
  );
  const qrRef = useRef<HTMLDivElement>(null);

  const paymentTypes = {
    'nft-purchase': {
      label: 'NFT Purchase',
      message: 'Purchase verified AI content NFT',
      memo: 'VeriAI - NFT Purchase',
      description: 'Buy verified AI-generated content NFT'
    },
    'verification-payment': {
      label: 'Content Verification',
      message: 'Pay for AI content verification',
      memo: 'VeriAI - Content Verification',
      description: 'Pay for professional AI content verification service'
    },
    'custom-payment': {
      label: 'Custom Payment',
      message: 'VeriAI platform payment',
      memo: 'VeriAI - Custom Payment',
      description: 'Custom payment for VeriAI services'
    }
  };

  // Set initial amount for NFT purchase mode
  useEffect(() => {
    if (mode === 'purchase' && nft) {
      setAmountToSend(parseFloat(nft.price));
      setPaymentType('nft-purchase');
    }
  }, [mode, nft]);

  const generateQrCode = async () => {
    try {
      if (!isConnected) {
        setError("Please connect your wallet first");
        onError?.("Please connect your wallet first");
        return;
      }

      setIsLoading(true);
      setError(null);

      // For NFT purchase, use seller address; for verification, use current wallet
      let recipientAddress = walletAddress;
      if (mode === 'purchase' && nft?.seller) {
        recipientAddress = nft.seller;
      }

      if (!recipientAddress) {
        setError("No wallet address available. Please try reconnecting.");
        onError?.("No wallet address available");
        return;
      }

      // Validate the recipient address
      let recipient: PublicKey;
      try {
        recipient = new PublicKey(recipientAddress);
      } catch (addressError) {
        setError("Invalid wallet address format");
        onError?.("Invalid wallet address format");
        return;
      }

      // Set the payment parameters
      const amount = new BigNumber(amountToSend);
      const reference = new Keypair().publicKey; // Unique reference
      const paymentConfig = paymentTypes[paymentType];
      
      // Custom message for NFT purchase
      let customMessage = paymentConfig.message;
      let customMemo = paymentConfig.memo;
      
      if (mode === 'purchase' && nft) {
        customMessage = `Purchase ${nft.name}`;
        customMemo = `VeriAI - NFT Purchase: ${nft.name} (ID: ${nft.id})`;
      }

      // Create the Solana Pay URL
      const url = encodeURL({
        recipient,
        amount,
        reference,
        label: paymentConfig.label,
        message: customMessage,
        memo: customMemo,
      });

      setQrUrl(url.toString());
      setShowModal(true);
    } catch (err) {
      console.error("QR Generation Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate QR code";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code when modal opens and URL is available
  useEffect(() => {
    if (showModal && qrUrl && qrRef.current) {
      qrRef.current.innerHTML = "";
      try {
        const qr = createQR(qrUrl, 300, "white");
        qr.append(qrRef.current);
      } catch (err) {
        setError("Failed to create QR code");
        onError?.("Failed to create QR code");
      }
    }
  }, [showModal, qrUrl, onError]);

  const closeModal = () => {
    setShowModal(false);
    setQrUrl("");
    setError(null);
  };

  const handlePaymentComplete = () => {
    onPaymentComplete?.({
      amount: amountToSend,
      type: paymentType,
      nft: nft,
      timestamp: new Date().toISOString()
    });
    closeModal();
  };

  if (!isConnected) {
    return (
      <Card className="bg-white/90 dark:bg-slate-900/90 border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Solana Pay
          </CardTitle>
          <CardDescription>
            Connect your wallet to use Solana Pay for instant payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please connect your wallet to access Solana Pay features
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // NFT Purchase Mode
  if (mode === 'purchase' && nft) {
    return (
      <>
        <Card className="bg-white/90 dark:bg-slate-900/90 border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Buy NFT with Solana Pay
              <Badge variant="secondary" className="ml-2">
                <Zap className="w-3 h-3 mr-1" />
                Instant
              </Badge>
            </CardTitle>
            <CardDescription>
              Purchase "{nft.name}" using Solana Pay QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* NFT Details */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">NFT:</span>
                <span className="text-sm">{nft.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Price:</span>
                <span className="text-sm font-mono">{nft.price} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Seller:</span>
                <span className="text-sm font-mono">{nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}</span>
              </div>
            </div>

            {/* Buy Button */}
            <Button
              onClick={generateQrCode}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                "Generating Payment QR..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy with Solana Pay
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Error: {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment QR Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-background border rounded-xl max-w-md w-full p-6 shadow-xl"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Purchase {nft.name}</h3>
                <p className="text-muted-foreground mb-6">
                  Scan with any Solana Pay compatible wallet
                </p>
                
                <div className="bg-white p-4 rounded-lg mb-4 inline-block shadow-sm">
                  <div ref={qrRef} className="flex justify-center" />
                </div>
                
                <div className="space-y-2 mb-6 text-left bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">NFT:</span>
                    <span className="font-medium">{nft.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{nft.price} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller:</span>
                    <span className="font-medium font-mono text-xs">{nft.seller.slice(0, 12)}...{nft.seller.slice(-4)}</span>
                  </div>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      {error}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={closeModal} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handlePaymentComplete} className="flex-1">
                    Payment Complete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  // Generator Mode (original functionality)
  return (
    <>
      <Card className="bg-white/90 dark:bg-slate-900/90 border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Solana Pay QR Generator
            <Badge variant="secondary" className="ml-2">
              <Zap className="w-3 h-3 mr-1" />
              Instant
            </Badge>
          </CardTitle>
          <CardDescription>
            Generate Solana Pay QR codes for VeriAI payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Payment Type
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(paymentTypes).map(([key, config]) => (
                <div
                  key={key}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    paymentType === key
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-primary/5'
                  }`}
                  onClick={() => setPaymentType(key as any)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      paymentType === key 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {paymentType === key && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Amount (SOL)
            </label>
            <Input
              type="number"
              placeholder="Enter SOL amount"
              value={amountToSend || ''}
              onChange={(e) => setAmountToSend(Number(e.target.value))}
              step="0.01"
              min="0"
              className="text-center text-lg font-mono"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateQrCode}
            disabled={isLoading || amountToSend <= 0}
            className="w-full"
          >
            {isLoading ? (
              "Generating QR..."
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Generate Payment QR
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && !showModal && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Error: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-background border rounded-xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Solana Pay QR Code</h3>
              <p className="text-muted-foreground mb-6">
                Scan with any Solana Pay compatible wallet
              </p>
              
              <div className="bg-white p-4 rounded-lg mb-4 inline-block shadow-sm">
                <div ref={qrRef} className="flex justify-center" />
              </div>
              
              <div className="space-y-2 mb-6 text-left bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{paymentTypes[paymentType].label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{amountToSend} SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Message:</span>
                  <span className="font-medium text-xs">{paymentTypes[paymentType].message}</span>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    {error}
                  </p>
                </div>
              )}
              
              <Button onClick={closeModal} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}