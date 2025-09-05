import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

// Get Web3Auth Client ID from environment variables
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

if (!clientId) {
  throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required. Please set it in your .env.local file");
}

// Web3Auth Configuration for VeriAI - Simple configuration that works
export const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Use devnet for development
    uiConfig: {
      appName: "VeriAI",
      mode: "auto", 
      logoLight: "/veriai-logo.png", 
      logoDark: "/veriai-logo.png",  
      defaultLanguage: "en",
      theme: {
        primary: "#6366f1", // VeriAI brand color (indigo)
      },
    },
  },
};

export default web3AuthContextConfig;
