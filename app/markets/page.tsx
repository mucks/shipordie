'use client';

import { useState, useMemo, useEffect } from 'react';
import { useReadContract, useReadContracts, useChainId } from 'wagmi';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketMetadata, MarketState, MarketCategory } from '@/lib/types';
import { MarketCard } from '@/components/MarketCard';
import { MarketFilters, FilterType, SortType } from '@/components/MarketFilters';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface MarketWithId {
  id: number;
  market: Market;
  metadata: MarketMetadata;
  impliedProbability: number;
  totalPool: bigint;
  participantCount: number;
}

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('deadline');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | undefined>();
  
  const chainId = useChainId();

  // Read total market count
  const { data: marketCount, error: marketCountError, isLoading: isLoadingCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'marketCount',
  });

  // Debug logging
  useEffect(() => {
    if (marketCountError) {
      console.error('Error reading marketCount:', marketCountError);
    }
    console.log('Market Debug:', {
      contractAddress: MILESTONE_PREDICTION_ADDRESS,
      chainId,
      marketCount: marketCount?.toString(),
      isLoadingCount,
      error: marketCountError?.message,
    });
  }, [marketCount, marketCountError, isLoadingCount, chainId]);

  const totalMarkets = Number(marketCount ?? BigInt(0));

  // Create contracts array for batch reading
  const contracts = useMemo(() => {
    return Array.from({ length: totalMarkets }, (_, i) => ({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'getMarket' as const,
      args: [BigInt(i)] as const,
    }));
  }, [totalMarkets]);

  // Batch read all markets
  const { data: marketsData } = useReadContracts({
    contracts,
    query: {
      enabled: totalMarkets > 0,
    },
  });

  // Map on-chain markets to MarketWithId format
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

  // Use only on-chain markets
  const allMarkets = useMemo(() => {
    return onChainMarkets;
  }, [onChainMarkets]);

  // Filter and sort markets
  const filteredAndSortedMarkets = useMemo(() => {
    let filtered = allMarkets;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) =>
        m.metadata.title.toLowerCase().includes(query) ||
        m.metadata.description.toLowerCase().includes(query) ||
        m.metadata.startupName?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((m) => m.metadata.category === selectedCategory);
    }

    // Status filters
    switch (activeFilter) {
      case 'verified':
        filtered = filtered.filter((m) => m.metadata.deliveryStatus === 'VERIFIED');
        break;
      case 'ending-soon':
        filtered = filtered.filter((m) => {
          const deadline = new Date(Number(m.market.deadline) * 1000);
          const daysUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return daysUntil > 0 && daysUntil <= 30;
        });
        break;
      case 'highest-stake':
        filtered = filtered.sort((a, b) => {
          if (a.totalPool > b.totalPool) return -1;
          if (a.totalPool < b.totalPool) return 1;
          return 0;
        });
        break;
      case 'new':
        filtered = filtered.sort((a, b) => {
          const deadlineA = Number(a.market.deadline);
          const deadlineB = Number(b.market.deadline);
          return deadlineB - deadlineA; // Newest first
        });
        break;
    }

    // Sort
    switch (sortBy) {
      case 'deadline':
        filtered = filtered.sort((a, b) => {
          const deadlineA = Number(a.market.deadline);
          const deadlineB = Number(b.market.deadline);
          return deadlineA - deadlineB; // Soonest first
        });
        break;
      case 'market-cap':
        filtered = filtered.sort((a, b) => {
          if (a.totalPool > b.totalPool) return -1;
          if (a.totalPool < b.totalPool) return 1;
          return 0;
        });
        break;
      case 'participants':
        filtered = filtered.sort((a, b) => {
          return b.participantCount - a.participantCount;
        });
        break;
      case 'confidence':
        filtered = filtered.sort((a, b) => {
          // Sort by how far from 50% (more confident = further from 50%)
          const confidenceA = Math.abs(a.impliedProbability - 50);
          const confidenceB = Math.abs(b.impliedProbability - 50);
          return confidenceB - confidenceA;
        });
        break;
    }

    return filtered;
  }, [allMarkets, searchQuery, activeFilter, sortBy, selectedCategory]);

  const totalDisplayed = filteredAndSortedMarkets.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#1a1a1a]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tight text-white mb-2">All Markets</h1>
          <p className="text-white font-bold text-lg">
            {totalDisplayed} {totalDisplayed === 1 ? 'market' : 'markets'} available
          </p>
        </div>
        <Link href="/markets/create">
          <Button>Create Market</Button>
        </Link>
      </div>

      {/* Error Display */}
      {marketCountError && (
        <div className="mb-6 p-4 bg-red-500 border-4 border-black neobrutal-shadow">
          <h3 className="text-xl font-black uppercase text-white mb-2">⚠️ Connection Error</h3>
          <p className="text-white font-bold text-sm mb-2">
            Failed to read contract: {marketCountError.message}
          </p>
          <div className="text-white text-xs space-y-1">
            <p>• Contract: {MILESTONE_PREDICTION_ADDRESS}</p>
            <p>• Network: Chain ID {chainId} {chainId === 97 ? '(BSC Testnet)' : chainId === 56 ? '(BSC Mainnet)' : '(Unknown)'}</p>
            <p>• Make sure your wallet is connected to the correct network where the contract is deployed</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingCount && !marketCountError && (
        <div className="mb-6 p-4 bg-blue-500 border-4 border-black neobrutal-shadow">
          <p className="text-white font-bold">Loading markets...</p>
        </div>
      )}

      <MarketFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredAndSortedMarkets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-blue-500 border-4 border-black neobrutal-shadow flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">📊</span>
          </div>
          <h3 className="text-3xl font-black uppercase text-white mb-3">No markets found</h3>
          <p className="text-white font-bold text-lg mb-8">
            {searchQuery || selectedCategory || activeFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Be the first to create a milestone prediction market!'}
          </p>
          {!searchQuery && !selectedCategory && activeFilter === 'all' && (
            <Link href="/markets/create">
              <Button>Create First Market</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedMarkets.map((market) => (
            <MarketCard
              key={market.id}
              marketId={market.id}
              market={market.market}
              participantCount={market.participantCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

