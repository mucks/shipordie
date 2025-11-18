# 🚀 Quick Start Guide

Get ProofMarket up and running in 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] MetaMask wallet installed
- [ ] Some testnet BNB (from faucet)

## Step-by-Step Setup

### 1️⃣ Clone & Install (2 minutes)

```bash
cd /path/to/proofmarket
pnpm install
```

### 2️⃣ Get WalletConnect Project ID (3 minutes)

1. Visit https://cloud.walletconnect.com
2. Sign up/Login
3. Create new project: "ProofMarket"
4. Copy Project ID

### 3️⃣ Deploy Smart Contract (3 minutes)

**Using Remix (Easiest):**

1. Go to https://remix.ethereum.org
2. Create new file: `MilestonePrediction.sol`
3. Copy contract from `/contracts/MilestonePrediction.sol`
4. Click "Solidity Compiler" → Compile
5. Click "Deploy & Run" → Select "Injected Provider - MetaMask"
6. Switch MetaMask to BSC Testnet:
   - Network: BNB Smart Chain Testnet
   - RPC: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - Chain ID: `97`
7. Get test BNB: https://testnet.binance.org/faucet-smart
8. Click "Deploy" in Remix
9. Copy deployed contract address

### 4️⃣ Configure Environment (1 minute)

Create `.env.local`:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=wc_abc123...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### 5️⃣ Run Application (1 minute)

```bash
pnpm dev
```

Visit: http://localhost:3000

## 🎮 Test the Flow

### Create Your First Market

1. Click "Connect Wallet" (top right)
2. Navigate to "Create Market"
3. Fill in:
   ```
   Title: Launch MVP
   Description: Complete and deploy our MVP by the deadline
   Deadline: [tomorrow's date]
   Stake: 0.01 BNB
   ```
4. Click "Create Market"
5. Confirm transaction in MetaMask

### Place a Bet

1. Go to "Markets"
2. Click on your market
3. In "Place Your Bet" panel:
   - Enter 0.005 BNB in YES field
   - Click "Bet YES"
   - Confirm in MetaMask

### Resolve Market (After Deadline)

1. Wait for deadline to pass (or adjust system time)
2. Go to "Admin" page
3. Click "Lock Market"
4. Click "Resolve YES" or "Resolve NO"
5. Go back to market page
6. Click "Claim Reward" if you won

## 🔧 Troubleshooting

### "Cannot connect to contract"
→ Check contract address in `.env.local`
→ Verify you're on BSC Testnet (Chain ID 97)

### "Insufficient funds"
→ Get testnet BNB: https://testnet.binance.org/faucet-smart
→ Need at least 0.02 BNB for testing

### "Transaction failed"
→ Increase gas limit in MetaMask
→ Ensure deadline is in future (use datetime-local format)

### "Module not found"
→ Run `pnpm install` again
→ Delete `node_modules` and reinstall

## 📝 Important Notes

- **Oracle Address**: The wallet that deploys the contract is the oracle
- **Testnet**: Always test on BSC Testnet first
- **Gas Fees**: Keep some BNB for gas in your wallet
- **Deadline Format**: Use the datetime-local picker in the form
- **Minimum Stake**: No minimum, but 0.01 BNB recommended for testing

## 🎯 Next Steps

Once your local setup works:

1. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```
   Add environment variables in Vercel dashboard

2. **Test with Friends**:
   - Share your deployed URL
   - Ask them to connect wallet and bet
   - Test the full flow

3. **Deploy to Mainnet** (after testing):
   - Get real BNB
   - Deploy contract to BSC Mainnet (Chain ID 56)
   - Update `.env.local` with mainnet contract

## 🆘 Still Stuck?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
2. Verify BSC Testnet configuration in MetaMask
3. Check transaction on https://testnet.bscscan.com
4. Ensure WalletConnect Project ID is correct
5. Try clearing browser cache and reconnecting wallet

## ✅ Success Checklist

- [ ] Frontend running on localhost:3000
- [ ] Wallet connects successfully
- [ ] Can create markets
- [ ] Can place bets
- [ ] Can lock markets after deadline
- [ ] Can resolve markets (as oracle)
- [ ] Winners can claim rewards

---

**Time to build**: ~10 minutes
**Time to test full flow**: ~5 minutes

Happy building! 🎉




