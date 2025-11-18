'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import TopStartups from '@/components/TopStartups';
import { MarketCard } from '@/components/MarketCard';
import { useMemo } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketMetadata } from '@/lib/types';

interface MarketWithId {
  id: number;
  market: Market;
  metadata: MarketMetadata;
  impliedProbability: number;
  totalPool: bigint;
  participantCount: number;
}

export default function Home() {
  const { data: marketCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'marketCount',
  });

  const totalMarkets = Number(marketCount ?? BigInt(0));

  const contracts = useMemo(() => {
    return Array.from({ length: Math.min(totalMarkets, 3) }, (_, i) => ({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'getMarket' as const,
      args: [BigInt(i)] as const,
    }));
  }, [totalMarkets]);

  const { data: marketsData } = useReadContracts({
    contracts,
    query: {
      enabled: totalMarkets > 0,
    },
  });

  const onChainMarkets: MarketWithId[] = useMemo(() => {
    if (!marketsData) return [];
    return marketsData
      .map((result, i) => {
        if (result.status !== 'success') return null;
        const market = result.result as Market;
        let metadata: MarketMetadata = { title: 'Untitled', description: '' };
        try {
          metadata = JSON.parse(market.metadataURI);
        } catch {
          metadata.title = market.metadataURI;
        }
        const totalPool = market.yesPool + market.noPool + market.creatorStake;
        const impliedProbability = totalPool > BigInt(0)
          ? Math.round((Number(market.yesPool) / Number(totalPool)) * 100)
          : 50;

        return {
          id: i,
          market,
          metadata,
          impliedProbability,
          totalPool,
          participantCount: metadata.participants || 0,
        };
      })
      .filter((m): m is MarketWithId => m !== null);
  }, [marketsData]);

  const allMarkets = useMemo(() => {
    return onChainMarkets.slice(0, 3);
  }, [onChainMarkets]);

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      
      <section className="container mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-4xl font-black">Featured Markets</h2>
            <Link href="/markets">
              <Button 
                variant="outline"
                className="border-4 border-black brutalist-shadow font-bold uppercase tracking-wide text-sm"
                data-testid="button-view-all"
              >
                View All →
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground font-medium text-sm" data-testid="text-section-subtitle">
            Real-time prediction markets on startup execution. Track milestones, test conviction, and prove delivery.
          </p>
        </div>
        
        {allMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allMarkets.map((market) => (
              <MarketCard
                key={market.id}
                marketId={market.id}
                market={market.market}
                participantCount={market.participantCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl font-bold text-muted-foreground">No markets yet. Be the first to create one!</p>
            <Link href="/markets/create">
              <Button className="mt-6 border-4 border-black brutalist-shadow font-bold uppercase">
                Create Market
              </Button>
            </Link>
          </div>
        )}
      </section>
      
      <HowItWorks />
      <TopStartups />
    </div>
  );
}
