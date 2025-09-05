import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VeriAI - On-Chain AI Content Verification",
  description: "Cryptographically verify AI-generated content using Flare's Data Connector. Get immutable proof of authenticity for your AI outputs.",
  keywords: ["AI", "verification", "blockchain", "Flare", "NFT", "authentication"],
  authors: [{ name: "VeriAI Team" }],
  creator: "VeriAI",
  publisher: "VeriAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://veriai.app",
    title: "VeriAI - On-Chain AI Content Verification",
    description: "Cryptographically verify AI-generated content using Flare's Data Connector",
    siteName: "VeriAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeriAI - On-Chain AI Content Verification",
    description: "Cryptographically verify AI-generated content using Flare's Data Connector",
    creator: "@veriai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
