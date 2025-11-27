# Ship or Die 📊

**Prediction Markets for Startup Milestones**

A decentralized platform where founders create transparent prediction markets for their startup milestones, and investors/communities bet on execution.

![Built on BNB Chain](https://img.shields.io/badge/Built%20on-BNB%20Chain-F0B90B?style=for-the-badge&logo=binance)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)

## 🎯 Overview

Ship or Die turns startup execution into transparent, verifiable prediction markets. Founders stake tokens on their milestones, while investors and community members bet YES or NO on whether these milestones will be achieved.

## 🔑 Key Features

- 🎪 **Binary Prediction Markets** - YES/NO betting on milestone completion
- 💰 **Skin in the Game** - Founders must stake BNB to create markets
- 🏆 **Winner Takes All** - Proportional rewards from the total pool
- 🔒 **On-Chain Resolution** - Transparent, oracle-based outcome determination
- ⚡ **Built on BNB Chain** - Fast, low-cost transactions

## ❗ Why This Matters

Startup performance is often:
- **private**
- **unclear**
- **delayed**
- **exaggerated**

Investors rely on promises, not proof.
Ship or Die brings **accountability, public verification, and real economic incentives into the execution layer of startups**.

## 💰 Revenue Model
Ship or Die supports long-term sustainability through:
- **PRO subscription for investors & teams** 
- **Paid verified startup markets** 
- **Low protocol fees on each settlement** 
- **Optional enterprise dashboards for accelerators/VCs** 

**PRO/Premium Features** (Coming Soon)
- Ship or Die will introduce a **PRO subscription** offering:
- **Advanced analytics** (confidence models, execution scores)
- **Verified startup markets** (GitHub/Notion integrations)
- **VC-grade dashboards**
- **Higher betting limits**
- **Custom portfolio alerts**
- **Early access to high-value markets**
- Users can join the **PRO waitlist** directly on the site.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your WalletConnect Project ID and Contract Address

# Run development server
pnpm dev

# Visit http://localhost:3000
```

## 📖 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Complete setup and deployment instructions
- **[MVP Specification](./proof_of_execution_mvp.md)** - Product concept and architecture
- **[Smart Contract](./contracts/MilestonePrediction.sol)** - Solidity contract code

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS
- **Web3**: Wagmi, Viem, RainbowKit
- **Language**: TypeScript

### Smart Contract
- **Language**: Solidity ^0.8.24
- **Chain**: BNB Smart Chain (BSC)
- **Token**: Native BNB

## 🎮 How It Works

### 1. Create a Market
Founders create milestone markets by:
- Setting a clear milestone description
- Choosing a deadline
- Staking BNB to show commitment

### 2. Place Bets
Community members bet on the outcome:
- **Bet YES** - Milestone will be achieved
- **Bet NO** - Milestone won't be achieved
- Potential returns shown in real-time

### 3. Resolution
After the deadline:
- Market is locked (anyone can trigger)
- Oracle resolves YES or NO
- Winners claim proportional rewards

### 4. Claim Rewards
Winners receive:
```
Payout = (Total Pool) × (Your Bet / Winning Pool)
```

## 📁 Project Structure

```
proofmarket/
├── app/                      # Next.js app directory
│   ├── markets/             # Market pages
│   │   ├── page.tsx         # Markets listing
│   │   ├── create/          # Create market
│   │   └── [marketId]/      # Individual market
│   ├── admin/               # Admin panel
│   │   └── markets/         # Market resolution
│   └── layout.tsx           # Root layout with providers
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── MarketCard.tsx       # Market display card
│   ├── BetPanel.tsx         # Betting interface
│   ├── ClaimPanel.tsx       # Reward claiming
│   └── CreateMarketForm.tsx # Market creation form
├── lib/                     # Utilities
│   ├── web3/               # Web3 configuration
│   │   ├── wagmiConfig.ts  # Wagmi setup
│   │   └── contracts.ts    # Contract ABI & address
│   └── types.ts            # TypeScript types
└── contracts/              # Smart contracts
    └── MilestonePrediction.sol
```

## 🎨 User Flows

### Founder Flow
1. Connect wallet
2. Navigate to "Create Market"
3. Fill in milestone details
4. Set deadline and stake amount
5. Submit transaction
6. Share market with community

### Bettor Flow
1. Connect wallet
2. Browse markets
3. Click on interesting market
4. Review milestone details
5. Bet YES or NO with BNB amount
6. Wait for resolution
7. Claim rewards if won

### Oracle Flow (Admin)
1. Connect wallet (must be oracle address)
2. Go to Admin panel
3. Lock markets after deadline
4. Review milestone completion
5. Resolve to YES or NO
6. Winners can now claim

## 🔧 Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...deployed_contract_address
```

## 🧪 Testing

### Local Testing
1. Deploy contract to BSC Testnet (see DEPLOYMENT.md)
2. Get testnet BNB from faucet
3. Create test market
4. Place test bets
5. Advance time past deadline
6. Lock and resolve market
7. Claim rewards

### Testnet Details
- **Chain ID**: 97
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Faucet**: https://testnet.binance.org/faucet-smart
- **Explorer**: https://testnet.bscscan.com

## 🛠️ Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint
```

## 📊 Smart Contract

The `MilestonePrediction` contract provides:

- `createMarket()` - Create new milestone market
- `betYes()` - Bet YES on a market
- `betNo()` - Bet NO on a market
- `lockMarket()` - Lock market after deadline
- `resolveMarket()` - Oracle resolves outcome
- `claimReward()` - Claim winnings
- `calculatePotentialPayout()` - View potential returns

See [contracts/MilestonePrediction.sol](./contracts/MilestonePrediction.sol) for full implementation.

## 🗺️ Roadmap

### MVP (Current)
- ✅ Binary prediction markets
- ✅ BNB betting
- ✅ Manual oracle resolution
- ✅ Basic UI with RainbowKit

### Phase 2

- [ ] IPFS metadata storage  
- [ ] The Graph indexing  
- [ ] GitHub milestone verification  
- [ ] Reputation NFTs  
- [ ] Market categories  
  - [ ] Private / unlisted markets  
  - [ ] Verified Startup Badges (paid)  

### Pro / Premium Features (Coming Soon)
- [ ] Advanced analytics (confidence models, execution scores)  
- [ ] Founder reputation profiles  
- [ ] Watchlist alerts & notifications  

### Phase 3
- [ ] Multi-oracle consensus
- [ ] Dispute resolution
- [ ] VC dashboards
- [ ] AI credibility scoring
- [ ] Notion integration

### Phase 4 
- [ ] AI + Automation

## ⚠️ Security Notice

This is an MVP for demonstration purposes. Before production deployment:

- ✅ Audit smart contract
- ✅ Add access controls
- ✅ Implement emergency pause
- ✅ Add dispute mechanism
- ✅ Test extensively on testnet
- ✅ Consider bug bounty program

## 📄 License

MIT

## 👥 Team
- **Lana Shevchenko** — Product Lead & Growth Strategist
Tech entrepreneur and founder of several startups, acting as a bridge between Startups × VCs and driving strategic partnerships across Web3 & AI ecosystems.
Fractional CMO with 18+ years of experience building ventures.
Specializes in product design, narrative, user experience, and go-to-market strategy.
Passionate about turning complex concepts into clean, scalable products.

- **Mucks** — Lead Engineer & Smart Contract Developer
Full-stack engineer with deep experience in blockchain development, and on-chain tooling.
Built multiple crypto dApps, automation tools, and smart contract architectures.
Prioritizes fast iteration, high performance, and security-first engineering.


## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- Open an issue on GitHub
- Review the [Deployment Guide](./DEPLOYMENT.md)
- Check BSCScan for contract state

---

**Built fast. Iterate faster.** 🚀

*Ship or Die - Where execution meets accountability*
