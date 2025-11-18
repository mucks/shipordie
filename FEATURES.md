# ProofMarket - Feature List & Routes

## 📍 Application Routes

### Public Routes

#### `/` - Landing Page
- Hero section with call-to-action
- Feature overview (Create, Bet, Earn)
- Statistics display
- Navigation to markets

#### `/markets` - Markets Listing
- Grid view of all markets
- Real-time pool distribution bars
- Market state badges (Open, Locked, Resolved)
- Filtering by state
- Empty state with CTA
- Market count display

#### `/markets/[marketId]` - Market Detail
- Full market information
- Milestone description
- Pool distribution visualization
- YES/NO percentages
- Creator and deadline info
- Betting interface (if open)
- Claim rewards panel (if resolved)
- User position display

#### `/markets/create` - Create Market
- Market creation form
- Input validation
- Real-time transaction status
- Auto-redirect after success

#### `/admin/markets` - Admin Panel
- Oracle address verification
- Market management table
- Lock market functionality (anyone)
- Resolve market (oracle only)
- Quick stats per market
- Transaction status feedback

## 🎨 Components

### UI Components (`/components/ui/`)

#### Button
- Variants: primary, secondary, outline, danger
- Sizes: sm, md, lg
- Disabled states
- Loading states

#### Card
- Card wrapper
- CardHeader
- CardContent
- CardTitle
- Consistent padding and shadows

#### Input
- Label support
- Error message display
- Full width
- Validation states

#### Textarea
- Label support
- Error messages
- Resizable
- Validation states

#### Badge
- Variants: default, success, warning, danger, info
- Rounded pill style
- Small size for inline use

### Feature Components (`/components/`)

#### MarketCard
- Compact market overview
- Pool distribution bar
- State badge
- Deadline display
- Total pool amount
- Click-through to detail page
- Hover effects

#### BetPanel
- YES betting interface
- NO betting interface
- Amount inputs
- Potential return calculator
- Real-time odds
- Transaction confirmation
- Disabled state for closed markets

#### ClaimPanel
- User position display
- Win/loss indication
- Reward amount calculation
- Claim button
- Already claimed state
- Connect wallet prompt

#### CreateMarketForm
- All form fields with validation
- Deadline picker (datetime-local)
- Stake amount input
- Metadata JSON creation
- Transaction handling
- Success feedback
- Error handling

#### Providers
- WagmiProvider setup
- QueryClientProvider
- RainbowKitProvider
- Global state management

## 🔧 Core Features

### Web3 Integration

✅ **Wallet Connection**
- RainbowKit integration
- MetaMask support
- WalletConnect support
- Network switching
- Account display

✅ **Smart Contract Interaction**
- Read contract state
- Write transactions
- Transaction monitoring
- Error handling
- Gas estimation

✅ **Real-time Updates**
- React Query caching
- Automatic refetching
- Optimistic updates
- Transaction receipts

### Market Lifecycle

✅ **Market Creation**
- Title, description, startup name
- Deadline selection (future only)
- Stake amount in BNB
- Metadata JSON storage
- Event emission
- Transaction confirmation

✅ **Betting**
- YES side betting
- NO side betting
- Amount validation
- Pool updates
- Potential payout preview
- Transaction confirmation

✅ **Market Locking**
- Automatic after deadline
- Anyone can trigger
- State transition
- Event emission

✅ **Resolution**
- Oracle-only access
- YES/NO outcome
- State validation
- Event emission

✅ **Reward Claims**
- Winner calculation
- Proportional distribution
- Claimed state tracking
- Transfer execution
- Double-claim prevention

### User Experience

✅ **Responsive Design**
- Mobile-friendly
- Tablet optimized
- Desktop layouts
- Touch-friendly buttons

✅ **Loading States**
- Skeleton screens
- Button spinners
- Transaction pending
- Confirmation waiting

✅ **Error Handling**
- Form validation
- Transaction errors
- Network errors
- User feedback

✅ **Visual Feedback**
- Success messages
- Error messages
- Transaction status
- Badge indicators
- Color coding (green=YES, red=NO)

## 📊 Smart Contract Features

### State Management
- Market count tracking
- Individual market state
- User bet tracking
- Pool accumulation
- Resolution status

### Access Control
- Oracle designation
- Creator tracking
- Timelock enforcement
- State-based permissions

### Safety Features
- Deadline validation
- State machine
- Reentrancy protection (via state checks)
- Input validation
- Zero-address checks

### Calculations
- Pool distribution
- Proportional payouts
- Potential returns
- Winner determination

## 🎯 User Flows

### Founder Flow
1. Connect wallet
2. Create market with stake
3. Share with community
4. Wait for bets
5. Milestone deadline
6. Oracle resolves
7. (Optional) Claim if bet on own success

### Bettor Flow
1. Connect wallet
2. Browse markets
3. Research milestone
4. Place YES or NO bet
5. Wait for resolution
6. Claim reward if won

### Oracle Flow
1. Connect wallet (must be oracle)
2. View pending markets
3. Lock markets after deadline
4. Review milestone completion
5. Resolve to YES or NO
6. Community claims rewards

## 🔒 Security Features

### Current Implementation
- Solidity 0.8.24+ (overflow protection)
- State machine pattern
- Time-based locks
- Access control (oracle)
- Event logging

### Recommended Additions
- Multi-sig oracle
- Dispute period
- Emergency pause
- Withdrawal patterns
- Rate limiting

## 📈 Data Display

### Market Statistics
- Total pool size
- YES pool amount
- NO pool amount
- Pool percentages
- Creator stake
- Deadline countdown
- State indicators

### User Statistics
- Personal bets (YES/NO)
- Position value
- Potential returns
- Claim status
- Win/loss record

## 🎨 Design System

### Colors
- Primary: Blue (600-700)
- Success: Green (500-600)
- Warning: Yellow (100-800)
- Danger: Red (500-600)
- Neutral: Gray (50-900)

### Typography
- Font: Geist Sans
- Mono: Geist Mono
- Sizes: sm, base, lg, xl, 2xl, 3xl, 4xl

### Spacing
- Consistent padding: 4, 6, 8, 12
- Margins: 2, 4, 6, 8
- Gaps: 3, 4, 6, 8

## 🚀 Performance

### Optimizations
- Next.js App Router
- React Server Components
- Client components only when needed
- Wagmi query caching
- Lazy loading
- Code splitting

### Bundle Size
- Minimal dependencies
- Tree shaking
- No unnecessary libraries
- Tailwind CSS purging

## 🧪 Testing Scenarios

### Happy Path
1. ✅ Create market
2. ✅ Place bets (both sides)
3. ✅ Lock after deadline
4. ✅ Resolve to winner
5. ✅ Claim rewards

### Edge Cases
- Zero bets on one side
- No bets at all
- Same user bets both sides
- Multiple claims attempt
- Resolution before lock
- Bet after deadline

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (sm)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: > 1024px (lg)
- **Wide**: > 1280px (xl)

## 🎁 Nice-to-Have Features (Not Implemented)

Future enhancements:
- Market search
- Category filtering
- User profiles
- Leaderboard
- Market comments
- Share buttons
- Price charts
- Historical data
- Email notifications
- Telegram bot

## 📦 Tech Stack Summary

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- TailwindCSS
- Wagmi v2
- Viem v2
- RainbowKit
- TanStack Query

**Smart Contract:**
- Solidity 0.8.24
- Native BNB
- No external dependencies
- ~2KB compiled size

**Infrastructure:**
- Vercel (recommended)
- BSC RPC nodes
- WalletConnect
- MetaMask

---

**Total Features**: 30+
**Total Routes**: 5
**Total Components**: 12+
**Lines of Code**: ~2,500
**Build Time**: ~2 hours




