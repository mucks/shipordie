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

  // Map results to market objects
  const markets: { id: number; data: Market | undefined }[] = useMemo(() => {
    if (!marketsData) return [];
    return marketsData.map((result, i) => ({
      id: i,
      data: result.status === 'success' ? (result.result as Market) : undefined,
    }));
  }, [marketsData]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Connect Wallet</h2>
          <p className="text-gray-600 dark:text-gray-300">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage market resolution and locking</p>
      </div>

      {/* Oracle Info */}
      <Card className="mb-8">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Oracle Address</p>
              <p className="font-mono text-sm">{oracleAddress as string}</p>
            </div>
            {isOracle ? (
              <Badge variant="success">You are the Oracle</Badge>
            ) : (
              <Badge variant="warning">Not Oracle</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Markets List */}
      <div className="space-y-4">
        {totalMarkets === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">No markets to manage yet.</p>
          </div>
        ) : (
          markets.map((market) => {
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

            return (
              <Card key={market.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        #{market.id} - {metadata.title}
                      </CardTitle>
                      {metadata.startupName && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">by {metadata.startupName}</p>
                      )}
                    </div>
                    <Badge variant={
                      m.state === MarketState.Open ? 'success' :
                      m.state === MarketState.Locked ? 'warning' : 'info'
                    }>
                      {MarketState[m.state]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">YES Pool</p>
                      <p className="font-semibold text-green-600">{formatEther(m.yesPool)} BNB</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">NO Pool</p>
                      <p className="font-semibold text-red-600">{formatEther(m.noPool)} BNB</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Deadline</p>
                      <p className="text-sm">{deadline.toLocaleDateString()}</p>
                      {isExpired && m.state === MarketState.Open && (
                        <Badge variant="danger" className="mt-1">Expired</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Total Pool</p>
                      <p className="font-semibold">
                        {formatEther(m.yesPool + m.noPool + m.creatorStake)} BNB
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {canLock && (
                      <Button
                        onClick={() => handleLockMarket(market.id)}
                        disabled={isPending || isConfirming}
                        variant="secondary"
                        size="sm"
                      >
                        {isPending || isConfirming ? 'Locking...' : 'Lock Market'}
                      </Button>
                    )}

                    {canResolve && (
                      <>
                        <Button
                          onClick={() => handleResolveMarket(market.id, Side.Yes)}
                          disabled={isPending || isConfirming}
                          variant="primary"
                          size="sm"
                        >
                          Resolve YES
                        </Button>
                        <Button
                          onClick={() => handleResolveMarket(market.id, Side.No)}
                          disabled={isPending || isConfirming}
                          variant="danger"
                          size="sm"
                        >
                          Resolve NO
                        </Button>
                      </>
                    )}

                    {m.state === MarketState.Resolved && (
                      <Badge variant="info">
                        Resolved: {m.winningSide === Side.Yes ? 'YES' : 'NO'}
                      </Badge>
                    )}

                    {!canLock && !canResolve && m.state === MarketState.Open && (
                      <p className="text-sm text-gray-600">Waiting for deadline...</p>
                    )}

                    {m.state === MarketState.Locked && !isOracle && (
                      <p className="text-sm text-gray-600">Waiting for oracle resolution...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {isSuccess && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg">
          <p className="text-sm text-green-800">
            ✓ Transaction successful!
          </p>
        </div>
      )}
    </div>
  );
}


