'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit';
import { wagmiConfig, wagmiAdapter, projectId, networks } from '@/lib/web3/appkitConfig';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize AppKit once on client
    createAppKit({
      adapters: [wagmiAdapter],
      projectId: projectId!, // non-null: appkitConfig throws if undefined
      networks: networks as any, // satisfy AppKit typing; runtime networks already valid
      metadata: {
        name: 'Ship or Die',
        description: 'Prediction Markets for Startup Milestones',
        url: 'http://localhost:3000',
        icons: ['https://avatars.githubusercontent.com/u/37784886?s=200&v=4'],
      },
      themeMode: 'dark',
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


