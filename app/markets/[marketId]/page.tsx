'use client';

import { use } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketState, MarketMetadata, Side } from '@/lib/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BetPanel } from '@/components/BetPanel';
import { ClaimPanel } from '@/components/ClaimPanel';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ marketId: string }>;
}

export default function MarketPage({ params }: PageProps) {
  const { marketId } = use(params);
  const { address } = useAccount();
  const marketIdNum = parseInt(marketId);

  // Read market data
  const { data: marketData, isLoading } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'getMarket',
    args: [BigInt(marketIdNum)],
  });

  const market = marketData as Market | undefined;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Market not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">This market does not exist.</p>
          <Link href="/markets" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  // Parse metadata
  let metadata: MarketMetadata = { title: 'Untitled', description: '' };
  try {
    metadata = JSON.parse(market.metadataURI);
  } catch {
    metadata.title = market.metadataURI;
  }

  const totalPool = market.yesPool + market.noPool + market.creatorStake;
  const deadline = new Date(Number(market.deadline) * 1000);
  const isExpired = deadline < new Date();
  const isOpen = market.state === MarketState.Open && !isExpired;

  const yesPercentage = totalPool > BigInt(0) 
    ? Math.round((Number(market.yesPool) / Number(totalPool)) * 100) 
    : 0;
  const noPercentage = totalPool > BigInt(0) 
    ? Math.round((Number(market.noPool) / Number(totalPool)) * 100) 
    : 0;
  
  // Calculate implied probability (YES probability)
  const impliedProbability = totalPool > BigInt(0)
    ? Math.round((Number(market.yesPool) / Number(totalPool)) * 100)
    : 50;

  const getStateInfo = () => {
    switch (market.state) {
      case MarketState.Open:
        return {
          label: isExpired ? 'Awaiting Lock' : 'Open',
          variant: isExpired ? 'warning' : 'success',
        };
      case MarketState.Locked:
        return { label: 'Locked', variant: 'warning' };
      case MarketState.Resolved:
        return { label: 'Resolved', variant: 'info' };
      default:
        return { label: 'Unknown', variant: 'default' };
    }
  };

  const stateInfo = getStateInfo();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#1a1a1a]">
      <Link href="/markets" className="text-white hover:text-blue-400 mb-6 inline-block font-bold uppercase border-b-2 border-white hover:border-blue-400">
        ← Back to Markets
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{metadata.title}</CardTitle>
                  {metadata.startupName && (
                    <p className="text-white font-bold">by {metadata.startupName}</p>
                  )}
                </div>
                <Badge variant={stateInfo.variant as 'default' | 'success' | 'warning' | 'danger' | 'info'} className="text-sm px-3 py-1">
                  {stateInfo.label}
                </Badge>
              </div>
              
              {market.state === MarketState.Resolved && (
                <div className="p-4 bg-blue-500 border-4 border-black">
                  <p className="text-sm font-black uppercase text-white">
                    Market Resolved: Winning side is{' '}
                    <span className={market.winningSide === Side.Yes ? 'text-green-400' : 'text-red-400'}>
                      {market.winningSide === Side.Yes ? 'YES' : 'NO'}
                    </span>
                  </p>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-black uppercase mb-3 text-white">Description</h3>
                <p className="text-white whitespace-pre-wrap font-medium">{metadata.description}</p>
              </div>

              <div className="border-t-4 border-black pt-6">
                <h3 className="font-black uppercase mb-4 text-white">Pool Distribution</h3>
                
                {/* Implied Probability */}
                <div className="bg-blue-500 border-4 border-black p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase text-white">Implied Probability (YES)</span>
                    <span className="text-4xl font-black text-white">
                      {impliedProbability}%
                    </span>
                  </div>
                  <p className="text-xs text-white mt-2 font-bold">
                    Market price indicates {impliedProbability}% chance of YES outcome
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-green-600">YES {yesPercentage}%</span>
                    <span className="text-red-600">NO {noPercentage}%</span>
                  </div>
                  <div className="flex h-6 bg-gray-200 border-2 border-black overflow-hidden mb-4">
                    <div 
                      className="bg-green-500 border-r-2 border-black" 
                      style={{ width: `${yesPercentage}%` }}
                    />
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${noPercentage}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-black p-3 bg-[#1a1a1a]">
                      <p className="text-xs font-black uppercase text-white mb-1">YES Pool</p>
                      <p className="text-xl font-black text-green-400">
                        {formatEther(market.yesPool)} BNB
                      </p>
                    </div>
                    <div className="border-2 border-black p-3 bg-[#1a1a1a]">
                      <p className="text-xs font-black uppercase text-white mb-1">NO Pool</p>
                      <p className="text-xl font-black text-red-400">
                        {formatEther(market.noPool)} BNB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-4 border-black pt-6 grid grid-cols-2 gap-4">
                <div className="border-2 border-black p-3 bg-[#1a1a1a]">
                  <p className="text-xs font-black uppercase text-white mb-1">Total Pool</p>
                  <p className="text-2xl font-black text-white">{formatEther(totalPool)} BNB</p>
                </div>
                <div className="border-2 border-black p-3 bg-[#1a1a1a]">
                  <p className="text-xs font-black uppercase text-white mb-1">Creator Stake</p>
                  <p className="text-2xl font-black text-white">{formatEther(market.creatorStake)} BNB</p>
                </div>
                <div className="border-2 border-black p-3 bg-[#1a1a1a]">
                  <p className="text-xs font-black uppercase text-white mb-1">Deadline</p>
                  <p className="text-lg font-bold text-white">
                    {deadline.toLocaleString()}
                  </p>
                </div>
                <div className="border-2 border-black p-3 bg-[#1a1a1a]">
                  <p className="text-xs font-black uppercase text-white mb-1">Creator</p>
                  <p className="text-sm font-mono font-bold text-white">
                    {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {address && <ClaimPanel marketId={marketIdNum} winningSide={market.winningSide} marketState={market.state} />}
          
          <BetPanel 
            marketId={marketIdNum}
            yesPool={market.yesPool}
            noPool={market.noPool}
            creatorStake={market.creatorStake}
            isOpen={isOpen}
            creator={market.creator}
          />
        </div>
      </div>
    </div>
  );
}

