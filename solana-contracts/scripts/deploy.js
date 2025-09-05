// Import necessary modules and dependencies
const { Connection, Keypair, clusterApiUrl } = require('@solana/web3.js');
const { deployContract } = require('./deployContract'); // Custom module for deploying contracts

// Define async function to deploy contracts
async function deploy() {
    // Establish connection to Solana cluster
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    // Generate a new keypair for the deployer
    const deployerKeypair = Keypair.generate();

    // Airdrop SOL to the deployer account for transaction fees
    const airdropSignature = await connection.requestAirdrop(
        deployerKeypair.publicKey,
        2 * 1e9 // 2 SOL
    );

    // Wait for the airdrop transaction to be confirmed
    await connection.confirmTransaction(airdropSignature);

    // Deploy VeriAI main contract with proper parameters
    console.log('\n📄 Deploying VeriAISolana contract...');
    const veriAIAddress = await deployContract(
        connection,
        deployerKeypair,
        'VeriAISolana',
        {
            initialFee: '1000000', // 0.001 SOL in lamports
            treasury: deployerKeypair.publicKey.toBase58(),
            admin: deployerKeypair.publicKey.toBase58(),
            oracleRelayer: 'PLACEHOLDER_ORACLE_ADDRESS' // Will be updated after oracle deployment
        }
    );

    // Deploy Oracle Relayer first
    console.log('\n🔮 Deploying SolanaOracleRelayer...');
    const oracleAddress = await deployContract(
        connection,
        deployerKeypair,
        'SolanaOracleRelayer',
        {
            pythPriceFeeds: 'PYTH_PRICE_FEED_ADDRESS', // Solana Pyth address
            switchboardOracle: 'SWITCHBOARD_ORACLE_ADDRESS' // Switchboard address
        }
    );

    // Log the addresses of the deployed contracts
    console.log(`\n✅ VeriAISolana deployed at: ${veriAIAddress}`);
    console.log(`✅ SolanaOracleRelayer deployed at: ${oracleAddress}`);
}

// Execute the deploy function and handle errors
deploy()
    .then(() => console.log('\nDeployment script completed.'))
    .catch((error) => console.error('Error deploying contracts:', error));