'use client';

import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { bsc, bscTestnet } from '@reown/appkit/networks';

// Public project id from Reown dashboard
// Use placeholder during build if not set (will be validated at runtime)
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'placeholder-project-id';

// Validate at runtime (not during build)
if (typeof window !== 'undefined' && (!projectId || projectId === 'placeholder-project-id')) {
  // Throw on client so devs notice missing env quickly
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

export const networks = [bscTestnet, bsc];

// Set up Wagmi Adapter (Config)
// Note: projectId will be validated at runtime, but we need a non-empty string for build
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  defaultNetwork: bscTestnet, // Default to BSC Testnet for both local and production
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;


