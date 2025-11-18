import { Market, MarketMetadata, MarketState, Side, DeliveryStatus, MarketCategory, Startup } from './types';
import { parseEther } from 'viem';

// Helper to create a market with metadata
function createMockMarket(
  id: number,
  title: string,
  description: string,
  deadline: Date,
  creatorStake: string,
  yesPool: string,
  noPool: string,
  state: MarketState,
  category: MarketCategory,
  deliveryStatus: DeliveryStatus,
  participants: number,
  startupName?: string
): { market: Market; metadata: MarketMetadata } {
  const metadata: MarketMetadata = {
    title,
    description,
    startupName,
    category,
    deliveryStatus,
    participants,
    isFeatured: true,
  };

  return {
    market: {
      creator: `0x${'1'.repeat(40)}` as `0x${string}`,
      deadline: BigInt(Math.floor(deadline.getTime() / 1000)),
      creatorStake: parseEther(creatorStake),
      yesPool: parseEther(yesPool),
      noPool: parseEther(noPool),
      state,
      winningSide: Side.None,
      metadataURI: JSON.stringify(metadata),
      startupId: BigInt(0), // Mock markets don't have on-chain startupId, use 0
    },
    metadata,
  };
}

// Generate dates
const now = new Date();
const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
const threeMonthsFromNow = new Date(now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000);
const nineMonthsFromNow = new Date(now.getTime() + 9 * 30 * 24 * 60 * 60 * 1000);
const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

export const FEATURED_MARKETS = [
  createMockMarket(
    1000,
    'Will Tesla deliver Robotaxi in 2026?',
    'Tesla has promised fully autonomous robotaxis by 2026. Will they achieve Level 5 autonomy and launch a commercial robotaxi service?',
    new Date('2026-12-31'),
    '5.0',
    '45.2',
    '32.8',
    MarketState.Open,
    'AI',
    DeliveryStatus.ON_TRACK,
    1247,
    'Tesla'
  ),
  createMockMarket(
    1001,
    'Will OpenAI launch GPT-6 by Q2 2025?',
    'OpenAI has been rapidly iterating on GPT models. Will GPT-6 be released to the public by the end of Q2 2025?',
    new Date('2025-06-30'),
    '3.5',
    '28.9',
    '19.3',
    MarketState.Open,
    'AI',
    DeliveryStatus.AT_RISK,
    892,
    'OpenAI'
  ),
  createMockMarket(
    1002,
    'Will Apple release AR glasses by 2025?',
    'Apple has been working on AR/VR technology. Will they release consumer AR glasses by the end of 2025?',
    new Date('2025-12-31'),
    '4.2',
    '52.1',
    '38.7',
    MarketState.Open,
    'Gaming',
    DeliveryStatus.ON_TRACK,
    1563,
    'Apple'
  ),
  createMockMarket(
    1003,
    'Will Ethereum reach $10,000 by end of 2025?',
    'Ethereum has been gaining adoption. Will the price reach $10,000 USD by December 31, 2025?',
    new Date('2025-12-31'),
    '2.8',
    '67.4',
    '23.1',
    MarketState.Open,
    'DeFi',
    DeliveryStatus.ON_TRACK,
    2134,
    'Ethereum'
  ),
  createMockMarket(
    1004,
    'Will SpaceX land humans on Mars by 2030?',
    'SpaceX has ambitious plans for Mars colonization. Will they successfully land humans on Mars by 2030?',
    new Date('2030-12-31'),
    '6.5',
    '89.2',
    '45.6',
    MarketState.Open,
    'Infrastructure',
    DeliveryStatus.AT_RISK,
    3421,
    'SpaceX'
  ),
  createMockMarket(
    1005,
    'Will Neuralink complete first human brain implant trial by 2025?',
    'Neuralink has been developing brain-computer interfaces. Will they complete their first successful human trial by end of 2025?',
    new Date('2025-12-31'),
    '3.0',
    '34.5',
    '41.2',
    MarketState.Open,
    'AI',
    DeliveryStatus.AT_RISK,
    987,
    'Neuralink'
  ),
  createMockMarket(
    1006,
    'Will Amazon deliver packages via drone to 50% of US cities by 2026?',
    'Amazon Prime Air has been testing drone delivery. Will they expand to cover 50% of US cities by 2026?',
    new Date('2026-12-31'),
    '4.5',
    '56.8',
    '29.4',
    MarketState.Open,
    'Infrastructure',
    DeliveryStatus.ON_TRACK,
    1456,
    'Amazon'
  ),
  createMockMarket(
    1007,
    'Will Google achieve quantum supremacy for practical problems by 2026?',
    'Google has been working on quantum computing. Will they demonstrate quantum supremacy for a practical real-world problem by 2026?',
    new Date('2026-12-31'),
    '3.8',
    '42.3',
    '35.7',
    MarketState.Open,
    'AI',
    DeliveryStatus.AT_RISK,
    1123,
    'Google'
  ),
  createMockMarket(
    1008,
    'Will Beyond Meat reach profitability by Q4 2025?',
    'Beyond Meat has been working towards profitability. Will they achieve positive net income by Q4 2025?',
    new Date('2025-12-31'),
    '2.5',
    '19.6',
    '28.4',
    MarketState.Open,
    'FoodTech',
    DeliveryStatus.AT_RISK,
    756,
    'Beyond Meat'
  ),
  createMockMarket(
    1009,
    'Will Coinbase launch tokenized real estate platform by 2025?',
    'Coinbase has been exploring RWA (Real World Assets) tokenization. Will they launch a real estate tokenization platform by end of 2025?',
    new Date('2025-12-31'),
    '3.2',
    '38.9',
    '27.3',
    MarketState.Open,
    'RWA',
    DeliveryStatus.ON_TRACK,
    1034,
    'Coinbase'
  ),
];

// Helper to get all featured markets with calculated fields
export function getFeaturedMarkets(): Array<{
  id: number;
  market: Market;
  metadata: MarketMetadata;
  impliedProbability: number;
  totalPool: bigint;
  participantCount: number;
}> {
  return FEATURED_MARKETS.map(({ market, metadata }, index) => {
    const totalPool = market.yesPool + market.noPool + market.creatorStake;
    const impliedProbability = totalPool > BigInt(0)
      ? Math.round((Number(market.yesPool) / Number(totalPool)) * 100)
      : 50;

    return {
      id: 1000 + index,
      market,
      metadata,
      impliedProbability,
      totalPool,
      participantCount: metadata.participants || 0,
    };
  });
}

// Mock startups matching the featured markets
export const FEATURED_STARTUPS: Array<{ id: number; startup: Startup }> = [
  {
    id: 1000,
    startup: {
      creator: `0x${'1'.repeat(40)}` as `0x${string}`,
      name: 'Tesla',
      description: 'Electric vehicle and clean energy company revolutionizing transportation and energy storage.',
      category: 'AI',
      stage: 'Public',
      website: 'https://tesla.com',
      createdAt: BigInt(Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000)), // 1 year ago
    },
  },
  {
    id: 1001,
    startup: {
      creator: `0x${'2'.repeat(40)}` as `0x${string}`,
      name: 'OpenAI',
      description: 'AI research and deployment company creating safe artificial general intelligence.',
      category: 'AI/ML',
      stage: 'Private',
      website: 'https://openai.com',
      createdAt: BigInt(Math.floor((Date.now() - 300 * 24 * 60 * 60 * 1000) / 1000)), // ~10 months ago
    },
  },
  {
    id: 1002,
    startup: {
      creator: `0x${'3'.repeat(40)}` as `0x${string}`,
      name: 'Apple',
      description: 'Technology company designing and manufacturing consumer electronics, software, and online services.',
      category: 'Gaming',
      stage: 'Public',
      website: 'https://apple.com',
      createdAt: BigInt(Math.floor((Date.now() - 200 * 24 * 60 * 60 * 1000) / 1000)), // ~7 months ago
    },
  },
  {
    id: 1003,
    startup: {
      creator: `0x${'4'.repeat(40)}` as `0x${string}`,
      name: 'Ethereum',
      description: 'Decentralized blockchain platform enabling smart contracts and decentralized applications.',
      category: 'DeFi',
      stage: 'Public',
      website: 'https://ethereum.org',
      createdAt: BigInt(Math.floor((Date.now() - 400 * 24 * 60 * 60 * 1000) / 1000)), // ~13 months ago
    },
  },
  {
    id: 1004,
    startup: {
      creator: `0x${'5'.repeat(40)}` as `0x${string}`,
      name: 'SpaceX',
      description: 'Aerospace manufacturer and space transportation company working towards Mars colonization.',
      category: 'Infrastructure',
      stage: 'Private',
      website: 'https://spacex.com',
      createdAt: BigInt(Math.floor((Date.now() - 500 * 24 * 60 * 60 * 1000) / 1000)), // ~16 months ago
    },
  },
  {
    id: 1005,
    startup: {
      creator: `0x${'6'.repeat(40)}` as `0x${string}`,
      name: 'Neuralink',
      description: 'Neurotechnology company developing implantable brain-computer interfaces.',
      category: 'AI/ML',
      stage: 'Private',
      website: 'https://neuralink.com',
      createdAt: BigInt(Math.floor((Date.now() - 250 * 24 * 60 * 60 * 1000) / 1000)), // ~8 months ago
    },
  },
  {
    id: 1006,
    startup: {
      creator: `0x${'7'.repeat(40)}` as `0x${string}`,
      name: 'Amazon',
      description: 'E-commerce and cloud computing company revolutionizing retail and logistics.',
      category: 'Infrastructure',
      stage: 'Public',
      website: 'https://amazon.com',
      createdAt: BigInt(Math.floor((Date.now() - 600 * 24 * 60 * 60 * 1000) / 1000)), // ~20 months ago
    },
  },
  {
    id: 1007,
    startup: {
      creator: `0x${'8'.repeat(40)}` as `0x${string}`,
      name: 'Google',
      description: 'Technology company specializing in internet-related services and products, including quantum computing.',
      category: 'AI/ML',
      stage: 'Public',
      website: 'https://google.com',
      createdAt: BigInt(Math.floor((Date.now() - 700 * 24 * 60 * 60 * 1000) / 1000)), // ~23 months ago
    },
  },
  {
    id: 1008,
    startup: {
      creator: `0x${'9'.repeat(40)}` as `0x${string}`,
      name: 'Beyond Meat',
      description: 'Plant-based meat company creating sustainable alternatives to animal protein.',
      category: 'FoodTech',
      stage: 'Public',
      website: 'https://beyondmeat.com',
      createdAt: BigInt(Math.floor((Date.now() - 180 * 24 * 60 * 60 * 1000) / 1000)), // ~6 months ago
    },
  },
  {
    id: 1009,
    startup: {
      creator: `0x${'a'.repeat(40)}` as `0x${string}`,
      name: 'Coinbase',
      description: 'Cryptocurrency exchange platform exploring RWA tokenization and blockchain infrastructure.',
      category: 'DeFi',
      stage: 'Public',
      website: 'https://coinbase.com',
      createdAt: BigInt(Math.floor((Date.now() - 350 * 24 * 60 * 60 * 1000) / 1000)), // ~11 months ago
    },
  },
];

// Helper to get all featured startups
export function getFeaturedStartups(): Array<{ id: number; startup: Startup }> {
  return FEATURED_STARTUPS;
}

