'use client';

import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Market, MarketState, MarketMetadata, Side } from '@/lib/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMemo, useEffect } from 'react';
import Link from 'next/link';

export default function AdminMarketsPage() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Read oracle address
  const { data: oracleAddress } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'oracle',
  });

  // Read total market count
  const { data: marketCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'marketCount',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidate queries after successful lock/resolve to refresh data
  useEffect(() => {
    if (isSuccess) {
      // Invalidate all contract read queries to refresh market data
      queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  const totalMarkets = Number(marketCount ?? BigInt(0));
  const isOracle = address && oracleAddress && address.toLowerCase() === oracleAddress.toLowerCase();

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

  // Map results to market objects and filter by creator
  const allMarkets: { id: number; data: Market | undefined }[] = useMemo(() => {
    if (!marketsData) return [];
    return marketsData.map((result, i) => ({
      id: i,
      data: result.status === 'success' ? (result.result as Market) : undefined,
    }));
  }, [marketsData]);

  // Filter markets created by the connected user
  const userMarkets = useMemo(() => {
    if (!address || !allMarkets) return [];
    return allMarkets.filter((market) => {
      if (!market.data) return false;
      return market.data.creator.toLowerCase() === address.toLowerCase();
    });
  }, [allMarkets, address]);

  const handleLockMarket = (marketId: number) => {
    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'lockMarket',
      args: [BigInt(marketId)],
    });
  };

  const handleResolveMarket = (marketId: number, winningSide: Side) => {
    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'resolveMarket',
      args: [BigInt(marketId), winningSide],
    });
  };

  if (!address) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center py-20">
          <h2 className="text-4xl font-black mb-4">Connect Wallet</h2>
          <p className="text-muted-foreground font-medium">Please connect your wallet to manage your markets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-black mb-6">My Markets</h1>
        <p className="text-xl text-muted-foreground font-medium">
          Manage the markets you've created
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-card border-4 border-black brutalist-shadow-md p-6 mb-8">
        <CardContent className="p-0">
          <div className="flex items-start gap-4">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">About Market Management</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Once a market is created on-chain, it cannot be deleted. Markets are permanent and immutable. 
                You can view your markets and their status below. If a market has no bets yet and hasn't passed its deadline, 
                you may be able to cancel it through a contract upgrade in the future.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets List */}
      <div className="space-y-6">
        {userMarkets.length === 0 ? (
          <Card className="bg-card border-4 border-black brutalist-shadow-md p-12 text-center">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-black mb-4">No Markets Created Yet</h3>
            <p className="text-muted-foreground font-medium mb-6">
              You haven't created any markets yet. Create your first market to get started!
            </p>
            <Link href="/markets/create">
              <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                Create Your First Market
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-muted-foreground font-medium">
                You have created <span className="font-bold text-foreground">{userMarkets.length}</span> {userMarkets.length === 1 ? 'market' : 'markets'}
              </p>
            </div>
            {userMarkets.map((market) => {
            if (!market.data) return null;

            const m = market.data;
            let metadata: MarketMetadata = { title: 'Untitled', description: '' };
            try {
              metadata = JSON.parse(m.metadataURI);
            } catch {
              metadata.title = m.metadataURI;
            }

            const deadline = new Date(Number(m.deadline) * 1000);
            const isExpired = deadline < new Date();
            const canLock = m.state === MarketState.Open && isExpired;
            const canResolve = m.state === MarketState.Locked && isOracle;

            const hasBets = m.yesPool > BigInt(0) || m.noPool > BigInt(0);
            const canCancel = m.state === MarketState.Open && !hasBets && !isExpired;

            return (
              <Card key={market.id} className="bg-card border-4 border-black brutalist-shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-bold">
                          {metadata.title}
                        </CardTitle>
                        <Badge variant={
                          m.state === MarketState.Open ? 'success' :
                          m.state === MarketState.Locked ? 'warning' : 'info'
                        }>
                          {MarketState[m.state]}
                        </Badge>
                      </div>
                      {metadata.startupName && (
                        <p className="text-sm text-muted-foreground font-medium">by {metadata.startupName}</p>
                      )}
                      {metadata.description && (
                        <p className="text-sm text-muted-foreground font-medium mt-2 line-clamp-2">
                          {metadata.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">YES Pool</p>
                      <p className="font-black text-accent text-lg">{formatEther(m.yesPool)} BNB</p>
                    </div>
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">NO Pool</p>
                      <p className="font-black text-destructive text-lg">{formatEther(m.noPool)} BNB</p>
                    </div>
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Deadline</p>
                      <p className="font-bold text-sm">{deadline.toLocaleDateString()}</p>
                      {isExpired && m.state === MarketState.Open && (
                        <Badge variant="danger" className="mt-1 text-xs">Expired</Badge>
                      )}
                    </div>
                    <div className="border-2 border-black p-3 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Total Pool</p>
                      <p className="font-black text-lg">
                        {formatEther(m.yesPool + m.noPool + m.creatorStake)} BNB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/markets/${market.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-4 border-black brutalist-shadow font-bold uppercase"
                      >
                        View Market
                      </Button>
                    </Link>

                    {canLock && (
                      <Button
                        onClick={() => handleLockMarket(market.id)}
                        disabled={isPending || isConfirming}
                        variant="secondary"
                        size="sm"
                        className="border-4 border-black brutalist-shadow font-bold uppercase"
                      >
                        {isPending || isConfirming ? 'Locking...' : 'Lock Market'}
                      </Button>
                    )}

                    {canResolve && isOracle && (
                      <>
                        <Button
                          onClick={() => handleResolveMarket(market.id, Side.Yes)}
                          disabled={isPending || isConfirming}
                          variant="primary"
                          size="sm"
                          className="border-4 border-black brutalist-shadow font-bold uppercase"
                        >
                          Resolve YES
                        </Button>
                        <Button
                          onClick={() => handleResolveMarket(market.id, Side.No)}
                          disabled={isPending || isConfirming}
                          variant="danger"
                          size="sm"
                          className="border-4 border-black brutalist-shadow font-bold uppercase"
                        >
                          Resolve NO
                        </Button>
                      </>
                    )}

                    {m.state === MarketState.Resolved && (
                      <Badge variant="info" className="border-3 border-black brutalist-shadow-sm">
                        Resolved: {m.winningSide === Side.Yes ? 'YES' : 'NO'}
                      </Badge>
                    )}

                    {canCancel && (
                      <div className="ml-auto">
                        <Badge variant="warning" className="border-3 border-black brutalist-shadow-sm">
                          ⚠️ Cannot Delete: Markets are permanent once created
                        </Badge>
                      </div>
                    )}

                    {!canLock && !canResolve && m.state === MarketState.Open && !isExpired && (
                      <p className="text-sm text-muted-foreground font-medium">Active - Waiting for deadline...</p>
                    )}

                    {m.state === MarketState.Locked && !isOracle && (
                      <p className="text-sm text-muted-foreground font-medium">Locked - Waiting for oracle resolution...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </>
        )}
      </div>

      {isSuccess && (
        <div className="fixed bottom-4 right-4 p-4 bg-accent border-4 border-black brutalist-shadow-md">
          <p className="text-sm font-bold text-black">
            ✓ Transaction successful!
          </p>
        </div>
      )}
    </div>
  );
}


