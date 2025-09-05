#!/bin/bash

# VeriAI Backend Production Deployment Script
# This script sets up and starts the VeriAI backend for production deployment

set -e

echo "🚀 Starting VeriAI Backend Production Deployment..."

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    local required_vars=(
        "MONGODB_URI"
        "PRIVATE_KEY"
        "VERI_AI_CONTRACT_ADDRESS"
        "VERI_AI_NFT_CONTRACT_ADDRESS"
        "FDC_RELAYER_CONTRACT_ADDRESS"
        "NETWORK_URL"
        "NETWORK_CHAIN_ID"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    echo "✅ All required environment variables are set"
}

# Check if Node.js and npm are installed
check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        echo "❌ Node.js version 18 or higher is required"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
    echo "   Node.js: $(node --version)"
    echo "   npm: $(npm --version)"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm ci --production
    else
        echo "   Dependencies already installed"
    fi
    
    echo "✅ Dependencies installed"
}

# Build the application
build_application() {
    echo "🔨 Building application..."
    
    # Clean previous build
    rm -rf dist
    
    # Build TypeScript
    npm run build
    
    if [ ! -d "dist" ]; then
        echo "❌ Build failed - dist directory not found"
        exit 1
    fi
    
    echo "✅ Application built successfully"
}

# Test database connection
test_database_connection() {
    echo "🗄️  Testing database connection..."
    
    # Create a simple test script
    cat > test_db.js << 'EOF'
const mongoose = require('mongoose');

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Database connection successful');
        process.exit(0);
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF
    
    node test_db.js
    rm test_db.js
}

# Test contract connections
test_contract_connections() {
    echo "🔗 Testing contract connections..."
    
    # Create a simple contract test script
    cat > test_contracts.js << 'EOF'
const { ethers } = require('ethers');

async function testContracts() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.NETWORK_URL);
        
        // Test network connection
        const network = await provider.getNetwork();
        console.log('✅ Network connection successful:', network.name, 'Chain ID:', network.chainId.toString());
        
        // Test contract addresses
        const contracts = {
            'VeriAI': process.env.VERI_AI_CONTRACT_ADDRESS,
            'VeriAINFT': process.env.VERI_AI_NFT_CONTRACT_ADDRESS,
            'FDCRelayer': process.env.FDC_RELAYER_CONTRACT_ADDRESS
        };
        
        for (const [name, address] of Object.entries(contracts)) {
            const code = await provider.getCode(address);
            if (code === '0x') {
                console.log(`❌ ${name} contract not found at ${address}`);
                process.exit(1);
            } else {
                console.log(`✅ ${name} contract verified at ${address}`);
            }
        }
        
        console.log('✅ All contract connections successful');
        process.exit(0);
    } catch (error) {
        console.log('❌ Contract connection failed:', error.message);
        process.exit(1);
    }
}

testContracts();
EOF
    
    node test_contracts.js
    rm test_contracts.js
}

# Start the application
start_application() {
    echo "🎯 Starting VeriAI Backend..."
    
    # Set production environment
    export NODE_ENV=production
    
    echo "🌐 Server Configuration:"
    echo "   Environment: $NODE_ENV"
    echo "   Port: ${PORT:-3001}"
    echo "   Network: ${NETWORK_CHAIN_ID} (${NETWORK_URL})"
    echo "   Database: MongoDB Atlas"
    echo ""
    echo "📄 Contract Addresses:"
    echo "   VeriAI: $VERI_AI_CONTRACT_ADDRESS"
    echo "   VeriAINFT: $VERI_AI_NFT_CONTRACT_ADDRESS"
    echo "   FDCRelayer: $FDC_RELAYER_CONTRACT_ADDRESS"
    echo ""
    
    # Start the server
    echo "🚀 Starting server..."
    npm start
}

# Main execution
main() {
    echo "═══════════════════════════════════════════════════════════"
    echo "           VeriAI Backend Production Deployment            "
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    
    check_env_vars
    check_dependencies
    install_dependencies
    build_application
    test_database_connection
    test_contract_connections
    
    echo ""
    echo "✅ All pre-deployment checks passed!"
    echo ""
    
    start_application
}

# Handle interrupts gracefully
trap 'echo ""; echo "❌ Deployment interrupted"; exit 1' INT TERM

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
