'use client';

import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';

interface BetPanelProps {
  marketId: number;
  yesPool: bigint;
  noPool: bigint;
  creatorStake: bigint;
  isOpen: boolean;
}

export function BetPanel({ marketId, yesPool, noPool, creatorStake, isOpen }: BetPanelProps) {
  const [yesAmount, setYesAmount] = useState('');
  const [noAmount, setNoAmount] = useState('');
  const queryClient = useQueryClient();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Invalidate queries after successful bet to refresh data
  useEffect(() => {
    if (isSuccess) {
      // Invalidate all contract read queries to refresh market data
      queryClient.invalidateQueries();
      // Clear input fields after successful bet
      setYesAmount('');
      setNoAmount('');
    }
  }, [isSuccess, queryClient]);

  const handleBetYes = async () => {
    if (!yesAmount || parseFloat(yesAmount) <= 0) return;
    
    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'betYes',
      args: [BigInt(marketId)],
      value: parseEther(yesAmount),
    });
  };

  const handleBetNo = async () => {
    if (!noAmount || parseFloat(noAmount) <= 0) return;
    
    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'betNo',
      args: [BigInt(marketId)],
      value: parseEther(noAmount),
    });
  };

  const calculatePotentialReturn = (betAmount: string, pool: bigint, side: 'yes' | 'no') => {
    if (!betAmount || parseFloat(betAmount) <= 0) return '0';
    
    const bet = parseEther(betAmount);
    const totalPool = yesPool + noPool + creatorStake;
    const newPool = side === 'yes' ? yesPool + bet : noPool + bet;
    const newTotalPool = totalPool + bet;
    
    if (newPool === BigInt(0)) return '0';
    
    const payout = (newTotalPool * bet) / newPool;
    return formatEther(payout);
  };

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">This market is no longer accepting bets</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bet YES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-green-600">Bet YES</h4>
            <span className="text-sm text-gray-600">
              Pool: {formatEther(yesPool)} BNB
            </span>
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.0 BNB"
            value={yesAmount}
            onChange={(e) => setYesAmount(e.target.value)}
          />
          {yesAmount && parseFloat(yesAmount) > 0 && (
            <p className="text-sm text-gray-600">
              Potential return: <span className="font-semibold">
                {calculatePotentialReturn(yesAmount, yesPool, 'yes')} BNB
              </span>
            </p>
          )}
          <Button 
            onClick={handleBetYes}
            disabled={isPending || isConfirming || !yesAmount || parseFloat(yesAmount) <= 0}
            className="w-full"
            variant="primary"
          >
            {isPending || isConfirming ? 'Confirming...' : 'Bet YES'}
          </Button>
        </div>

        <div className="border-t border-gray-200" />

        {/* Bet NO */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-red-600">Bet NO</h4>
            <span className="text-sm text-gray-600">
              Pool: {formatEther(noPool)} BNB
            </span>
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.0 BNB"
            value={noAmount}
            onChange={(e) => setNoAmount(e.target.value)}
          />
          {noAmount && parseFloat(noAmount) > 0 && (
            <p className="text-sm text-gray-600">
              Potential return: <span className="font-semibold">
                {calculatePotentialReturn(noAmount, noPool, 'no')} BNB
              </span>
            </p>
          )}
          <Button 
            onClick={handleBetNo}
            disabled={isPending || isConfirming || !noAmount || parseFloat(noAmount) <= 0}
            className="w-full"
            variant="danger"
          >
            {isPending || isConfirming ? 'Confirming...' : 'Bet NO'}
          </Button>
        </div>

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Bet placed successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


