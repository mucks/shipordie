'use client';

import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Startup, Market, MarketMetadata } from '@/lib/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMemo } from 'react';
import Link from 'next/link';

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

export default function AdminStartupsPage() {
  const { address } = useAccount();

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

  // Map results to startup objects and filter by creator
  const allStartups: { id: number; data: Startup | undefined }[] = useMemo(() => {
    if (!startupsData) return [];
    return startupsData.map((result, i) => ({
      id: i,
      data: result.status === 'success' ? (result.result as Startup) : undefined,
    }));
  }, [startupsData]);

  // Filter startups created by the connected user
  const userStartups = useMemo(() => {
    if (!address || !allStartups) return [];
    return allStartups.filter((startup) => {
      if (!startup.data) return false;
      return startup.data.creator.toLowerCase() === address.toLowerCase();
    });
  }, [allStartups, address]);

  // Map markets and aggregate by startupId
  const marketsByStartup = useMemo(() => {
    const map: Record<number, Array<{ id: number; market: Market; metadata: MarketMetadata }>> = {};
    
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
  }, [marketsData]);

  // Combine startup data with market stats
  const startupsList = useMemo(() => {
    return userStartups
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
          createdAt: startup.data!.createdAt,
        };
      })
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)); // Newest first
  }, [userStartups, marketsByStartup]);

  if (!address) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center py-20">
          <h2 className="text-4xl font-black mb-4">Connect Wallet</h2>
          <p className="text-muted-foreground font-medium">Please connect your wallet to manage your startups.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-black mb-6">My Startups</h1>
        <p className="text-xl text-muted-foreground font-medium">
          Manage the startups you've created
        </p>
      </div>

      {/* Startups List */}
      <div className="space-y-6">
        {startupsList.length === 0 ? (
          <Card className="bg-card border-4 border-black brutalist-shadow-md p-12 text-center">
            <div className="text-6xl mb-6">🏢</div>
            <h3 className="text-2xl font-black mb-4">No Startups Created Yet</h3>
            <p className="text-muted-foreground font-medium mb-6">
              You haven't created any startups yet. Create your first startup to get started!
            </p>
            <Link href="/startups/create">
              <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                Create Your First Startup
              </Button>
            </Link>
          </Card>
        ) : (
          startupsList.map((startup) => {
            return (
              <Card key={startup.id} className="bg-card border-4 border-black brutalist-shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-bold">
                          {startup.name}
                        </CardTitle>
                        <Badge
                          className={`border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs ${getCategoryColor(startup.category)}`}
                        >
                          {startup.category}
                        </Badge>
                        <Badge variant="info" className="border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs">
                          {startup.stage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-2">
                        {startup.description}
                      </p>
                      {startup.website && (
                        <a
                          href={startup.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm font-medium mt-2 inline-block"
                        >
                          {startup.website} →
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Stake</p>
                      <p className="font-black text-lg">
                        {startup.totalStake >= 1000000
                          ? `${(startup.totalStake / 1000000).toFixed(1)}M`
                          : startup.totalStake >= 1000
                          ? `${(startup.totalStake / 1000).toFixed(1)}K`
                          : startup.totalStake.toFixed(2)}{' '}
                        BNB
                      </p>
                    </div>
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Markets</p>
                      <p className="font-black text-lg">{startup.marketCount}</p>
                    </div>
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Created</p>
                      <p className="font-bold text-sm">
                        {new Date(Number(startup.createdAt) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/startups/${startup.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-4 border-black brutalist-shadow font-bold uppercase"
                      >
                        View Startup
                      </Button>
                    </Link>
                    <Link href="/markets/create">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="border-4 border-black brutalist-shadow font-bold uppercase"
                      >
                        Create Market
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

