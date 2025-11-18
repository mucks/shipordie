'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MarketCard } from '@/components/MarketCard';
import { useReadContract, useReadContracts } from 'wagmi';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketMetadata } from '@/lib/types';
import { getFeaturedMarkets } from '@/lib/mockData';
import { useMemo } from 'react';

interface MarketWithId {
  id: number;
  market: Market;
  metadata: MarketMetadata;
  impliedProbability: number;
  totalPool: bigint;
  participantCount: number;
}

export default function Watchlist() {
  const [watchedMarketIds, setWatchedMarketIds] = useState<string[]>([]);

  useEffect(() => {
    const watched = JSON.parse(localStorage.getItem('watchedMarkets') || '[]');
    setWatchedMarketIds(watched);
  }, []);

  const { data: marketCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'marketCount',
  });

  const totalMarkets = Number(marketCount ?? BigInt(0));

  const contracts = useMemo(() => {
    if (watchedMarketIds.length === 0) return [];
    return watchedMarketIds
      .map((id) => ({
        address: MILESTONE_PREDICTION_ADDRESS,
        abi: MILESTONE_PREDICTION_ABI,
        functionName: 'getMarket' as const,
        args: [BigInt(id)] as const,
      }));
  }, [watchedMarketIds]);

  const { data: marketsData } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  });

  const featuredMarkets = useMemo(() => getFeaturedMarkets(), []);

  const allMarkets: MarketWithId[] = useMemo(() => {
    const onChainMarkets: MarketWithId[] = [];
    
    if (marketsData) {
      marketsData.forEach((result, i) => {
        if (result.status === 'success') {
          const market = result.result as Market;
          const marketId = parseInt(watchedMarketIds[i]);
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

          onChainMarkets.push({
            id: marketId,
            market,
            metadata,
            impliedProbability,
            totalPool,
            participantCount: metadata.participants || 0,
          });
        }
      });
    }

    // Also include featured markets that are watched
    const watchedFeatured = featuredMarkets.filter((m) => 
      watchedMarketIds.includes(m.id.toString())
    );

    return [...watchedFeatured, ...onChainMarkets];
  }, [marketsData, watchedMarketIds, featuredMarkets]);

  const hasWatchedMarkets = allMarkets.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="max-w-4xl mb-16">
            <h1 
              className="text-5xl md:text-6xl font-black mb-6"
              data-testid="heading-watchlist"
            >
              Watchlist
            </h1>
            <p 
              className="text-xl md:text-2xl text-muted-foreground font-bold mb-6"
              data-testid="text-subheadline"
            >
              Save the markets you care about and follow execution in real time.
            </p>
            <p 
              className="text-lg text-muted-foreground font-medium leading-relaxed"
              data-testid="text-description"
            >
              Keep your favorite startups and milestone predictions in one place. Track progress, deadlines, and status changes without losing anything important.
            </p>
          </div>

          {/* Markets List or Empty State */}
          {hasWatchedMarkets ? (
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
            <Card 
              className="bg-card border-4 border-black brutalist-shadow-md p-12 max-w-2xl mx-auto text-center"
              data-testid="card-empty-state"
            >
              <div className="text-6xl mb-6">⭐</div>
              <h3 className="text-3xl font-black mb-4">Your watchlist is empty</h3>
              <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                Start building your watchlist by clicking the star icon on any market card. 
                You'll be able to track your favorite startups and milestones all in one place.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/markets">
                  <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                    Browse Markets
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

