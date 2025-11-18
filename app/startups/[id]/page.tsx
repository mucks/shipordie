'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useReadContract, useReadContracts } from 'wagmi';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketMetadata, Startup } from '@/lib/types';
import { MarketCard } from '@/components/MarketCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatEther } from 'viem';

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'AI/ML': 'bg-blue-500 border-blue-700 text-white',
    'DeFi': 'bg-green-500 border-green-700 text-white',
    'Infrastructure': 'bg-indigo-500 border-indigo-700 text-white',
    'Gaming': 'bg-pink-500 border-pink-700 text-white',
    'Social': 'bg-cyan-500 border-cyan-700 text-white',
    'Enterprise': 'bg-gray-500 border-gray-700 text-white',
    'FoodTech': 'bg-orange-500 border-orange-700 text-white',
    'RWA': 'bg-yellow-500 border-yellow-700 text-white',
    'AI': 'bg-blue-500 border-blue-700 text-white',
    'Other': 'bg-primary border-primary text-primary-foreground',
  };
  return colors[category] || 'bg-primary border-primary text-primary-foreground';
}

export default function StartupProfilePage() {
  const params = useParams();
  const startupId = params?.id ? Number(params.id) : null;

  // Read startup count and market count
  const { data: startupCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'startupCount',
  });

  const { data: marketCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'marketCount',
  });

  const totalStartups = Number(startupCount ?? BigInt(0));
  const totalMarkets = Number(marketCount ?? BigInt(0));

  // Read on-chain startup
  const { data: onChainStartup } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'getStartup',
    args: startupId !== null ? [BigInt(startupId)] : undefined,
    query: {
      enabled: startupId !== null,
    },
  });

  // Read all markets
  const marketContracts = useMemo(() => {
    return Array.from({ length: totalMarkets }, (_, i) => ({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'getMarket' as const,
      args: [BigInt(i)] as const,
    }));
  }, [totalMarkets]);

  const { data: marketsData } = useReadContracts({
    contracts: marketContracts,
    query: {
      enabled: totalMarkets > 0,
    },
  });

  // Get startup data (on-chain only)
  const startup: Startup | null = useMemo(() => {
    if (startupId === null) return null;
    return onChainStartup as Startup | null;
  }, [startupId, onChainStartup]);

  // Get markets for this startup (on-chain only)
  const markets = useMemo(() => {
    if (startupId === null || !startup) return [];

    const marketList: Array<{ id: number; market: Market; metadata: MarketMetadata }> = [];

    if (marketsData) {
      marketsData.forEach((result, i) => {
        if (result.status === 'success') {
          const market = result.result as Market;
          const marketStartupId = Number(market.startupId);
          if (marketStartupId === startupId) {
            let metadata: MarketMetadata = { title: 'Untitled', description: '' };
            try {
              metadata = JSON.parse(market.metadataURI);
            } catch {
              metadata.title = market.metadataURI;
            }
            marketList.push({ id: i, market, metadata });
          }
        }
      });
    }

    return marketList;
  }, [startupId, startup, marketsData]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalStake = markets.reduce((sum, { market }) => {
      const totalPoolWei = market.yesPool + market.noPool + market.creatorStake;
      return sum + parseFloat(formatEther(totalPoolWei));
    }, 0);

    const activeMarkets = markets.filter(({ market }) => market.state === 0).length;
    const resolvedMarkets = markets.filter(({ market }) => market.state === 2).length;

    return {
      totalStake,
      activeMarkets,
      resolvedMarkets,
      totalMarkets: markets.length,
    };
  }, [markets]);

  if (startupId === null) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center py-20">
          <h2 className="text-4xl font-black mb-4">Invalid Startup ID</h2>
          <p className="text-muted-foreground font-medium mb-6">The startup ID is invalid.</p>
          <Link href="/startups">
            <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
              Back to Startups
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center py-20">
          <h2 className="text-4xl font-black mb-4">Startup Not Found</h2>
          <p className="text-muted-foreground font-medium mb-6">The startup you're looking for doesn't exist.</p>
          <Link href="/startups">
            <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
              Back to Startups
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-12">
            <Link href="/startups" className="inline-block mb-6">
              <Button variant="ghost" className="font-semibold text-base cursor-pointer">
                ← Back to Startups
              </Button>
            </Link>
            
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-20 w-20 bg-primary border-4 border-black flex items-center justify-center">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black mb-2">{startup.name}</h1>
                    <Badge
                      className={`border-3 border-black brutalist-shadow-sm font-bold uppercase text-sm ${getCategoryColor(startup.category)}`}
                    >
                      {startup.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xl text-muted-foreground font-medium mb-4 max-w-3xl">
                  {startup.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <span className="font-bold text-muted-foreground">Stage:</span>{' '}
                    <span className="font-semibold">{startup.stage}</span>
                  </div>
                  {startup.website && (
                    <div>
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold"
                      >
                        Website →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card border-4 border-black brutalist-shadow-md p-6">
              <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Total Stake</div>
              <div className="text-3xl font-black">
                {stats.totalStake >= 1000000
                  ? `${(stats.totalStake / 1000000).toFixed(1)}M`
                  : stats.totalStake >= 1000
                  ? `${(stats.totalStake / 1000).toFixed(1)}K`
                  : stats.totalStake.toFixed(2)}{' '}
                BNB
              </div>
            </div>
            <div className="bg-card border-4 border-black brutalist-shadow-md p-6">
              <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Total Markets</div>
              <div className="text-3xl font-black">{stats.totalMarkets}</div>
            </div>
            <div className="bg-card border-4 border-black brutalist-shadow-md p-6">
              <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Active Markets</div>
              <div className="text-3xl font-black">{stats.activeMarkets}</div>
            </div>
            <div className="bg-card border-4 border-black brutalist-shadow-md p-6">
              <div className="text-sm font-bold uppercase text-muted-foreground mb-2">Resolved</div>
              <div className="text-3xl font-black">{stats.resolvedMarkets}</div>
            </div>
          </div>

          {/* Markets List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black">Markets</h2>
              <Link href="/markets/create">
                <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                  + Create Market
                </Button>
              </Link>
            </div>

            {markets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {markets.map(({ id, market, metadata }) => {
                  const totalPool = market.yesPool + market.noPool + market.creatorStake;
                  const impliedProbability = totalPool > BigInt(0)
                    ? Math.round((Number(market.yesPool) / Number(totalPool)) * 100)
                    : 50;

                  return (
                    <MarketCard
                      key={id}
                      marketId={id}
                      market={market}
                      participantCount={metadata.participants || 0}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border-4 border-black brutalist-shadow-md">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-black mb-4">No Markets Yet</h3>
                <p className="text-muted-foreground font-medium mb-6">
                  This startup doesn't have any markets yet. Be the first to create one!
                </p>
                <Link href="/markets/create">
                  <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                    Create First Market
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

