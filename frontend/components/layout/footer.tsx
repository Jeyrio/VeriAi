import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Globe } from 'lucide-react';
import { VeriAILogo } from '@/components/ui/veri-ai-logo';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <VeriAILogo size="md" />
            <p className="text-sm text-muted-foreground mt-4">
              On-chain verification for AI-generated content using Flare&apos;s Data Connector.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/verify" className="hover:text-foreground transition-colors">
                  Verify Content
                </Link>
              </li>
              <li>
                <Link href="/collection" className="hover:text-foreground transition-colors">
                  My Collection
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div className="space-y-4">
            <h4 className="font-semibold">Technology</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://flare.network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Flare Network
                </a>
              </li>
              <li>
                <a 
                  href="https://dev.flare.network/fdc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Data Connector
                </a>
              </li>
              <li>
                <a 
                  href="https://coston2.testnet.flarescan.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Explorer
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com/veriai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/veriai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://veriai.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VeriAI. Built on Flare Network.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
