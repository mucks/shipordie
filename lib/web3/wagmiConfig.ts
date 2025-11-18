import { bscTestnet, bsc } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';

// IMPORTANT: Avoid importing RainbowKit at module scope on the server.
// Export a factory so RainbowKit is only required on the client.
export function getWagmiConfig() {
  return createConfig({
    chains: [bscTestnet, bsc],
    ssr: false,
    connectors: [
      injected(),
      metaMask(),
      coinbaseWallet({ appName: 'Ship or Die' }),
    ],
    transports: {
      [bscTestnet.id]: http(),
      [bsc.id]: http(),
    },
    // Default to BSC Testnet for both local and production
    // This ensures consistency when the wallet first connects
  });
}


