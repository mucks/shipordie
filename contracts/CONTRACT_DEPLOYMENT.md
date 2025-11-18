# Smart Contract Deployment Guide

## MilestonePrediction Contract

### Contract Overview

- **File**: `MilestonePrediction.sol`
- **Solidity Version**: ^0.8.24
- **License**: MIT
- **Constructor**: No arguments required
- **Initial Oracle**: Deployer address

## Deployment Steps

### Using Remix IDE (Recommended)

1. **Open Remix**
   - Go to https://remix.ethereum.org

2. **Create File**
   - In File Explorer, create: `MilestonePrediction.sol`
   - Copy entire contract code from this directory

3. **Compile Contract**
   - Click "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.24` or higher
   - Click "Compile MilestonePrediction.sol"
   - Verify green checkmark appears

4. **Configure Network**
   
   **For BSC Testnet:**
   - Open MetaMask
   - Click network dropdown
   - Add Network:
     - Network Name: `BNB Smart Chain Testnet`
     - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545/`
     - Chain ID: `97`
     - Symbol: `tBNB`
     - Block Explorer: `https://testnet.bscscan.com`

   **For BSC Mainnet:**
   - Network Name: `BNB Smart Chain`
   - RPC URL: `https://bsc-dataseed1.binance.org/`
   - Chain ID: `56`
   - Symbol: `BNB`
   - Block Explorer: `https://bscscan.com`

5. **Get BNB**
   
   **Testnet:**
   - Visit https://testnet.binance.org/faucet-smart
   - Enter your wallet address
   - Claim 0.5 tBNB
   
   **Mainnet:**
   - Purchase BNB from exchange
   - Send to your wallet

6. **Deploy**
   - Click "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Confirm network in MetaMask (should show BSC Testnet/Mainnet)
   - Contract: Select "MilestonePrediction"
   - Click "Deploy" (no constructor arguments needed)
   - Confirm transaction in MetaMask
   - Wait for confirmation

7. **Verify Deployment**
   - Copy deployed contract address from Remix
   - Visit BSCScan:
     - Testnet: `https://testnet.bscscan.com/address/YOUR_ADDRESS`
     - Mainnet: `https://bscscan.com/address/YOUR_ADDRESS`
   - Verify contract appears and has balance

8. **Save Important Info**
   ```
   Contract Address: 0x...
   Network: BSC Testnet/Mainnet
   Deployer (Oracle): 0x... (your wallet)
   Deployment TX: 0x...
   Block Number: ...
   ```

### Using Hardhat (Advanced)

1. **Install Hardhat**
   ```bash
   cd /path/to/proofmarket
   pnpm add -D hardhat @nomicfoundation/hardhat-toolbox
   pnpm add -D @nomicfoundation/hardhat-verify
   ```

2. **Initialize Hardhat**
   ```bash
   npx hardhat init
   # Choose "Create a TypeScript project"
   ```

3. **Configure hardhat.config.ts**
   ```typescript
   import { HardhatUserConfig } from "hardhat/config";
   import "@nomicfoundation/hardhat-toolbox";
   
   const config: HardhatUserConfig = {
     solidity: "0.8.24",
     networks: {
       bscTestnet: {
         url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
         chainId: 97,
         accounts: [process.env.PRIVATE_KEY!]
       },
       bscMainnet: {
         url: "https://bsc-dataseed1.binance.org/",
         chainId: 56,
         accounts: [process.env.PRIVATE_KEY!]
       }
     },
     etherscan: {
       apiKey: process.env.BSCSCAN_API_KEY
     }
   };
   
   export default config;
   ```

4. **Create Deploy Script**
   ```typescript
   // scripts/deploy.ts
   import { ethers } from "hardhat";
   
   async function main() {
     const MilestonePrediction = await ethers.getContractFactory("MilestonePrediction");
     const contract = await MilestonePrediction.deploy();
     
     await contract.waitForDeployment();
     const address = await contract.getAddress();
     
     console.log("MilestonePrediction deployed to:", address);
     console.log("Oracle (deployer):", await contract.oracle());
   }
   
   main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
   });
   ```

5. **Deploy**
   ```bash
   # Set private key (never commit this!)
   export PRIVATE_KEY=your_private_key
   
   # Deploy to testnet
   npx hardhat run scripts/deploy.ts --network bscTestnet
   
   # Deploy to mainnet
   npx hardhat run scripts/deploy.ts --network bscMainnet
   ```

6. **Verify Contract**
   ```bash
   npx hardhat verify --network bscTestnet YOUR_CONTRACT_ADDRESS
   ```

## After Deployment

### 1. Update Frontend Configuration

Edit `.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedAddress
```

### 2. Test Contract

Using Remix "Deploy & Run" tab:

**Read Functions (no gas):**
- `oracle()` - Should return your address
- `marketCount()` - Should return 0

**Write Functions (costs gas):**
- Try creating a test market
- Verify it appears on frontend

### 3. Verify on BSCScan

1. Go to your contract on BSCScan
2. Click "Contract" tab
3. If not verified, click "Verify and Publish"
4. Select compiler version: 0.8.24
5. Paste contract code
6. Submit

### 4. Set Up Oracle (If Needed)

To change oracle address:
```solidity
// Call updateOracle(newOracleAddress)
// Only current oracle can call this
```

## Contract Functions Reference

### Read Functions (Free)
- `marketCount()` - Total number of markets
- `markets(uint256 id)` - Get market by ID
- `getMarket(uint256 id)` - Get full market struct
- `getUserBet(uint256 id, address user)` - Get user's bet
- `calculatePotentialPayout(uint256 id, address user)` - Calculate returns
- `oracle()` - Get oracle address
- `bets(uint256 id, address user)` - Raw bet data

### Write Functions (Costs Gas)
- `createMarket(uint256 deadline, string metadataURI)` - Create market (payable)
- `betYes(uint256 id)` - Bet YES (payable)
- `betNo(uint256 id)` - Bet NO (payable)
- `lockMarket(uint256 id)` - Lock after deadline
- `resolveMarket(uint256 id, Side winningSide)` - Resolve (oracle only)
- `claimReward(uint256 id)` - Claim winnings
- `updateOracle(address newOracle)` - Change oracle (oracle only)

## Gas Estimates

Approximate gas costs on BSC:

| Function | Gas | Cost @ 3 Gwei |
|----------|-----|---------------|
| createMarket | ~150k | ~$0.02 |
| betYes/betNo | ~80k | ~$0.01 |
| lockMarket | ~50k | ~$0.005 |
| resolveMarket | ~60k | ~$0.007 |
| claimReward | ~100k | ~$0.01 |

*Actual costs vary with network congestion*

## Security Checklist

Before Mainnet deployment:

- [ ] Test all functions on testnet
- [ ] Verify oracle address is correct
- [ ] Test full market lifecycle
- [ ] Verify payout calculations
- [ ] Test edge cases (0 bets, ties, etc.)
- [ ] Consider audit (for large deployments)
- [ ] Set up monitoring
- [ ] Prepare emergency procedures

## Troubleshooting

### "Out of gas" error
- Increase gas limit in MetaMask
- BSC requires ~150k gas for deployment

### "Nonce too high/low"
- Reset MetaMask account (Settings → Advanced → Reset Account)

### "Invalid address" error
- Check network in MetaMask matches Remix
- Verify you have BNB for gas

### Contract verification failed
- Ensure exact Solidity version
- Check optimization settings match
- Try manual verification on BSCScan

## Post-Deployment Monitoring

**Watch For:**
- Unusual transaction patterns
- Large bets/manipulations
- Oracle resolution accuracy
- Gas cost spikes
- Contract balance

**Tools:**
- BSCScan alerts
- Tenderly monitoring
- Wallet notifications
- Custom event listeners

## Upgrading Contract

⚠️ This contract is not upgradeable. To upgrade:

1. Deploy new contract version
2. Migrate critical data manually
3. Update frontend to use new address
4. Announce migration to users
5. Leave old contract readable for history

## Support

- **BSCScan**: https://testnet.bscscan.com (testnet) or https://bscscan.com (mainnet)
- **BNB Faucet**: https://testnet.binance.org/faucet-smart
- **Gas Tracker**: https://bscscan.com/gastracker

---

**Deployment Time**: ~5 minutes (Remix) | ~15 minutes (Hardhat)
**Cost**: ~$0.05 (Testnet free with faucet)




