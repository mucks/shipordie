# ProofMarket Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm installed
- MetaMask or another Web3 wallet
- BNB for gas fees (testnet or mainnet)
- WalletConnect Project ID

## Environment Setup

Create a `.env.local` file in the root directory:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Contract Address (will be set after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## Step 1: Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Add it to `.env.local`

## Step 2: Deploy Smart Contract

### Option A: Using Remix IDE (Recommended for MVP)

1. Go to https://remix.ethereum.org
2. Create a new file `MilestonePrediction.sol`
3. Copy the contract code from `/contracts/MilestonePrediction.sol`
4. Compile with Solidity 0.8.24+
5. Connect to BSC Testnet:
   - Network: BNB Smart Chain Testnet
   - RPC: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency: tBNB
   - Block Explorer: https://testnet.bscscan.com
6. Get testnet BNB from https://testnet.binance.org/faucet-smart
7. Deploy the contract (no constructor arguments needed)
8. Copy the deployed contract address
9. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`

### Option B: Using Hardhat (Advanced)

```bash
# Install Hardhat
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Copy contract to contracts folder
# Update hardhat.config.js with BSC networks
# Deploy: npx hardhat run scripts/deploy.js --network bscTestnet
```

## Step 3: Install Dependencies

```bash
pnpm install
```

## Step 4: Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Step 5: Test the Application

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Create Market**: 
   - Go to "Create Market"
   - Fill in milestone details
   - Set deadline (future date)
   - Stake some BNB (0.01 for testing)
   - Submit transaction
3. **Place Bets**:
   - Go to "Markets" and click on your created market
   - Bet YES or NO with test BNB
4. **Lock Market** (after deadline):
   - Go to "Admin" page
   - Click "Lock Market" after deadline passes
5. **Resolve Market** (Oracle only):
   - As the contract deployer (oracle), resolve to YES or NO
6. **Claim Rewards**:
   - Winners can claim their rewards from the market page

## Step 6: Deploy to Production

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
# - NEXT_PUBLIC_CONTRACT_ADDRESS
```

### Deploy Contract to BSC Mainnet

⚠️ **WARNING**: Only deploy to mainnet after thorough testing on testnet!

1. Get mainnet BNB
2. Update MetaMask to BSC Mainnet:
   - RPC: https://bsc-dataseed1.binance.org/
   - Chain ID: 56
3. Deploy contract using Remix with Mainnet network
4. Update `.env.local` with mainnet contract address

## BSC Network Details

### Testnet
- **Network Name**: BNB Smart Chain Testnet
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Chain ID**: 97
- **Currency Symbol**: tBNB
- **Block Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.binance.org/faucet-smart

### Mainnet
- **Network Name**: BNB Smart Chain
- **RPC URL**: https://bsc-dataseed1.binance.org/
- **Chain ID**: 56
- **Currency Symbol**: BNB
- **Block Explorer**: https://bscscan.com

## Troubleshooting

### "Contract not deployed" error
- Ensure contract is deployed and address is set in `.env.local`
- Check you're on the correct network (testnet/mainnet)

### "Insufficient funds" error
- Get testnet BNB from faucet
- Ensure you have enough BNB for gas fees

### Wallet not connecting
- Check WalletConnect Project ID is correct
- Ensure wallet is on BSC network
- Clear browser cache and reconnect

### Transaction failing
- Check gas settings in wallet
- Ensure deadline is in the future for market creation
- Verify contract address is correct

## Next Steps (Post-MVP)

- [ ] Add indexing service (The Graph) for faster market loading
- [ ] Implement IPFS for metadata storage
- [ ] Add dispute mechanism for oracle resolution
- [ ] Create reputation NFTs for founders
- [ ] Add GitHub integration for automatic milestone verification
- [ ] Implement multi-oracle system
- [ ] Add market categories and filtering
- [ ] Create analytics dashboard

## Security Notes

⚠️ This is an MVP. Before production use:
- Get smart contract audited
- Implement access controls
- Add emergency pause functionality
- Set up monitoring and alerts
- Consider insurance or dispute resolution
- Add time locks for critical functions

## Support

For issues or questions:
- Check the smart contract on BSCScan
- Review transaction history
- Verify wallet connection and network
- Ensure sufficient gas fees

---

**Built with**: Next.js 16, Wagmi, Viem, RainbowKit, TailwindCSS
**Chain**: BNB Smart Chain (BSC)




