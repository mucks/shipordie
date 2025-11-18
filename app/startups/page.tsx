'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketMetadata, Startup } from '@/lib/types';
import { formatCompactNumber } from '@/lib/formatters';
import { formatEther } from 'viem';
import { getFeaturedStartups, getFeaturedMarkets } from '@/lib/mockData';

interface StartupData {
  id: number;
  name: string;
  category: string;
  description: string;
  stage: string;
  website: string;
  totalStake: number;
  marketCount: number;
  previewMarkets: Array<{ id: number; question: string }>;
}

function formatStake(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toFixed(2);
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'AI/ML': 'bg-blue-500 border-blue-700 text-white',
    'FINTECH': 'bg-green-500 border-green-700 text-white',
    'AUTOMOTIVE': 'bg-red-500 border-red-700 text-white',
    'DEVTOOLS': 'bg-purple-500 border-purple-700 text-white',
    'AI': 'bg-blue-500 border-blue-700 text-white',
    'DeFi': 'bg-green-500 border-green-700 text-white',
    'FoodTech': 'bg-orange-500 border-orange-700 text-white',
    'RWA': 'bg-yellow-500 border-yellow-700 text-white',
    'Web3': 'bg-purple-500 border-purple-700 text-white',
    'Gaming': 'bg-pink-500 border-pink-700 text-white',
    'Infrastructure': 'bg-indigo-500 border-indigo-700 text-white',
    'Social': 'bg-cyan-500 border-cyan-700 text-white',
    'Enterprise': 'bg-gray-500 border-gray-700 text-white',
    'Other': 'bg-primary border-primary text-primary-foreground',
  };
  return colors[category] || 'bg-primary border-primary text-primary-foreground';
}

export default function Startups() {
  // Read startup count
  const { data: startupCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'startupCount',
  });

  // Read market count
  const { data: marketCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'marketCount',
  });

  const totalStartups = Number(startupCount ?? BigInt(0));
  const totalMarkets = Number(marketCount ?? BigInt(0));

  // Create contracts array for batch reading startups
  const startupContracts = useMemo(() => {
    return Array.from({ length: totalStartups }, (_, i) => ({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'getStartup' as const,
      args: [BigInt(i)] as const,
    }));
  }, [totalStartups]);

  // Create contracts array for batch reading markets
  const marketContracts = useMemo(() => {
    return Array.from({ length: totalMarkets }, (_, i) => ({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'getMarket' as const,
      args: [BigInt(i)] as const,
    }));
  }, [totalMarkets]);

  // Batch read all startups
  const { data: startupsData } = useReadContracts({
    contracts: startupContracts,
    query: {
      enabled: totalStartups > 0,
    },
  });

  // Batch read all markets
  const { data: marketsData } = useReadContracts({
    contracts: marketContracts,
    query: {
      enabled: totalMarkets > 0,
    },
  });

  // Map results to startup objects
  const onChainStartups: Array<{ id: number; data: Startup | undefined }> = useMemo(() => {
    if (!startupsData) return [];
    return startupsData.map((result, i) => ({
      id: i,
      data: result.status === 'success' ? (result.result as Startup) : undefined,
    }));
  }, [startupsData]);

  // Get featured startups (mock data)
  const featuredStartups = useMemo(() => getFeaturedStartups(), []);

  // Combine featured (mock) and on-chain startups
  const startups: Array<{ id: number; data: Startup | undefined }> = useMemo(() => {
    const featured = featuredStartups.map(({ id, startup }) => ({
      id,
      data: startup,
    }));
    return [...featured, ...onChainStartups];
  }, [featuredStartups, onChainStartups]);

  // Get featured markets to match with mock startups
  const featuredMarkets = useMemo(() => getFeaturedMarkets(), []);

  // Map markets and aggregate by startupId (including mock markets for mock startups)
  const marketsByStartup = useMemo(() => {
    const map: Record<number, Array<{ id: number; market: Market; metadata: MarketMetadata }>> = {};
    
    // Add featured markets to mock startups based on startupName
    featuredMarkets.forEach(({ id, market, metadata }) => {
      if (metadata.startupName) {
        const mockStartup = featuredStartups.find((s) => s.startup.name === metadata.startupName);
        if (mockStartup) {
          if (!map[mockStartup.id]) {
            map[mockStartup.id] = [];
          }
          map[mockStartup.id].push({ id, market, metadata });
        }
      }
    });
    
    // Add on-chain markets
    if (marketsData) {
      marketsData.forEach((result, i) => {
        if (result.status === 'success') {
          const market = result.result as Market;
          let metadata: MarketMetadata = { title: 'Untitled', description: '' };
          try {
            metadata = JSON.parse(market.metadataURI);
          } catch {
            metadata.title = market.metadataURI;
          }
          
          const startupId = Number(market.startupId);
          if (startupId > 0 && startupId < 1000) {
            // Only on-chain startups (IDs < 1000)
            if (!map[startupId]) {
              map[startupId] = [];
            }
            map[startupId].push({ id: i, market, metadata });
          }
        }
      });
    }

    return map;
  }, [marketsData, featuredMarkets, featuredStartups]);

  // Combine startup data with market stats
  const startupsList: StartupData[] = useMemo(() => {
    return startups
      .filter((s) => s.data)
      .map((startup) => {
        const markets = marketsByStartup[startup.id] || [];
        const totalStake = markets.reduce((sum, { market }) => {
          const totalPoolWei = market.yesPool + market.noPool + market.creatorStake;
          return sum + parseFloat(formatEther(totalPoolWei));
        }, 0);

        return {
          id: startup.id,
          name: startup.data!.name,
          category: startup.data!.category,
          description: startup.data!.description,
          stage: startup.data!.stage,
          website: startup.data!.website,
          totalStake,
          marketCount: markets.length,
          previewMarkets: markets.slice(0, 2).map(({ id, metadata }) => ({
            id,
            question: metadata.title,
          })),
        };
      })
      .sort((a, b) => b.totalStake - a.totalStake);
  }, [startups, marketsByStartup]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl mb-12 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl md:text-6xl font-black mb-6">
                Startups
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Track startup execution. Bet on delivery. Hold founders accountable.
              </p>
            </div>
            <Link href="/startups/create">
              <Button className="border-4 border-black brutalist-shadow font-bold uppercase whitespace-nowrap">
                + Create Startup
              </Button>
            </Link>
          </div>

          {startupsList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-2xl font-bold text-muted-foreground mb-4">No startups yet.</p>
              <p className="text-muted-foreground font-medium mb-6">
                Create your first startup to start tracking milestones and markets.
              </p>
              <Link href="/startups/create">
                <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                  Create First Startup
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {startupsList.map((startup) => {
                const isTopMarket = startup.totalStake >= 100;
                const hoverClasses = isTopMarket
                  ? 'hover:scale-[1.03] hover:shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                  : 'hover:-translate-y-1 hover:border-primary hover:shadow-[8px_8px_0px_0px_rgba(55,114,255,0.5)]';
                
                return (
                  <Link key={startup.id} href={`/startups/${startup.id}`}>
                    <div
                      className={`bg-card border-4 border-black brutalist-shadow-md p-6 space-y-4 transition-all duration-200 cursor-pointer relative ${hoverClasses}`}
                      data-testid={`card-startup-${startup.name}`}
                    >
                      {/* Top Market Badge */}
                      {isTopMarket && (
                        <div className="absolute top-4 right-4">
                          <Badge
                            className="border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs bg-accent text-white flex items-center gap-1"
                            data-testid="badge-top-market"
                          >
                            🔥
                            Top Market
                          </Badge>
                        </div>
                      )}

                      {/* Logo/Icon */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-primary border-3 border-black flex items-center justify-center">
                            <span className="text-2xl">🏢</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold" data-testid="text-startup-name">
                              {startup.name}
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              {startup.stage}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <Badge
                        className={`border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs ${getCategoryColor(startup.category)}`}
                        data-testid="badge-category"
                      >
                        {startup.category}
                      </Badge>

                      {/* Description */}
                      {startup.description && (
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                          {startup.description}
                        </p>
                      )}

                      {/* Preview Markets */}
                      {startup.previewMarkets.length > 0 && (
                        <div className="space-y-2 pt-3 mt-3 border-t border-neutral-700">
                          <p className="text-xs font-semibold uppercase text-muted-foreground/70">
                            Active Markets
                          </p>
                          {startup.previewMarkets.map((market) => (
                            <div
                              key={market.id}
                              className="text-sm font-medium line-clamp-1"
                            >
                              • {market.question}
                            </div>
                          ))}
                          {startup.marketCount > 2 && (
                            <div className="text-sm text-muted-foreground font-medium">
                              +{startup.marketCount - 2} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-3 mt-3 border-t border-neutral-700">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase">
                            📈
                            Total Stake
                          </div>
                          <div className="font-bold" data-testid="text-total-stake">
                            {formatStake(startup.totalStake)} BNB
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase">
                            👥
                            Markets
                          </div>
                          <div className="font-bold" data-testid="text-market-count">
                            {startup.marketCount}
                          </div>
                        </div>
                      </div>

                      {/* View Markets Link */}
                      <span 
                        className="text-blue-400 hover:underline text-sm mt-2 inline-block" 
                        data-testid="link-view-markets"
                      >
                        View Markets →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

