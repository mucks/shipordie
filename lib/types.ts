export enum MarketState {
  Open = 0,
  Locked = 1,
  Resolved = 2,
}

export enum Side {
  None = 0,
  Yes = 1,
  No = 2,
}

export enum DeliveryStatus {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  VERIFIED = 'VERIFIED',
}

export type MarketCategory = 
  | 'AI'
  | 'DeFi'
  | 'FoodTech'
  | 'RWA'
  | 'Web3'
  | 'Gaming'
  | 'Infrastructure'
  | 'Social'
  | 'Enterprise'
  | 'Other';

export interface Startup {
  creator: `0x${string}`;
  name: string;
  description: string;
  category: string;
  stage: string;
  website: string;
  createdAt: bigint;
}

export interface Market {
  creator: `0x${string}`;
  deadline: bigint;
  creatorStake: bigint;
  yesPool: bigint;
  noPool: bigint;
  state: MarketState;
  winningSide: Side;
  metadataURI: string;
  startupId: bigint; // 0 means no startup
}

export interface Bet {
  yesAmount: bigint;
  noAmount: bigint;
  claimed: boolean;
}

export interface MarketMetadata {
  title: string;
  description: string;
  startupName?: string;
  category?: MarketCategory;
  deliveryStatus?: DeliveryStatus;
  participants?: number; // Mock data - not on-chain yet
  isFeatured?: boolean; // For mock featured markets
}

export interface MarketWithMetadata extends Market {
  id: number;
  metadata: MarketMetadata;
  impliedProbability: number; // YES probability as percentage
  totalPool: bigint;
  participantCount?: number; // Mock data
}



