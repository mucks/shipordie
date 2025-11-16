'use client';

import { useEffect } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Side, MarketState } from '@/lib/types';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';

interface ClaimPanelProps {
  marketId: number;
  winningSide: Side;
  marketState: MarketState;
}

export function ClaimPanel({ marketId, winningSide, marketState }: ClaimPanelProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  // Read user's bet
  const { data: userBet } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'getUserBet',
    args: [BigInt(marketId), address!],
    query: {
      enabled: !!address,
    },
  });

  // Read potential payout
  const { data: potentialPayout } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'calculatePotentialPayout',
    args: [BigInt(marketId), address!],
    query: {
      enabled: !!address,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidate queries after successful claim to refresh data
  useEffect(() => {
    if (isSuccess) {
      // Invalidate all contract read queries to refresh user bet and market data
      queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  const handleClaim = async () => {
    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'claimReward',
      args: [BigInt(marketId)],
    });
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-gray-600">Connect wallet to view your position</p>
        </CardContent>
      </Card>
    );
  }

  if (!userBet || (userBet.yesAmount === BigInt(0) && userBet.noAmount === BigInt(0))) {
    return null;
  }

  const hasWon = 
    (winningSide === Side.Yes && userBet.yesAmount > BigInt(0)) ||
    (winningSide === Side.No && userBet.noAmount > BigInt(0));

  const payout = winningSide === Side.Yes 
    ? (potentialPayout?.[0] || BigInt(0)) 
    : (potentialPayout?.[1] || BigInt(0));

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle>Your Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {userBet.yesAmount > BigInt(0) && (
            <div className="flex justify-between">
              <span className="text-green-600 font-medium">YES bet:</span>
              <span className="font-semibold">{formatEther(userBet.yesAmount)} BNB</span>
            </div>
          )}
          {userBet.noAmount > BigInt(0) && (
            <div className="flex justify-between">
              <span className="text-red-600 font-medium">NO bet:</span>
              <span className="font-semibold">{formatEther(userBet.noAmount)} BNB</span>
            </div>
          )}
        </div>

        {marketState === MarketState.Resolved && (
          <>
            <div className="border-t border-gray-200 pt-4">
              {hasWon ? (
                <>
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 You won! Winning side: {winningSide === Side.Yes ? 'YES' : 'NO'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Your reward:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatEther(payout)} BNB
                    </span>
                  </div>
                  {!userBet.claimed ? (
                    <Button 
                      onClick={handleClaim}
                      disabled={isPending || isConfirming}
                      className="w-full"
                      size="lg"
                    >
                      {isPending || isConfirming ? 'Claiming...' : 'Claim Reward'}
                    </Button>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-sm text-blue-800">
                        ✓ Reward already claimed
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Market resolved against your position. Winning side: {winningSide === Side.Yes ? 'YES' : 'NO'}
                  </p>
                </div>
              )}
            </div>

            {isSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Reward claimed successfully!
                </p>
              </div>
            )}
          </>
        )}

        {marketState === MarketState.Open && (
          <div className="text-sm text-gray-600 text-center">
            Market must be resolved before claiming
          </div>
        )}
      </CardContent>
    </Card>
  );
}


