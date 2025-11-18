'use client';

import { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Bet } from '@/lib/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';

interface BetPanelProps {
  marketId: number;
  yesPool: bigint;
  noPool: bigint;
  creatorStake: bigint;
  isOpen: boolean;
  creator?: `0x${string}`;
}

export function BetPanel({ marketId, yesPool, noPool, creatorStake, isOpen, creator }: BetPanelProps) {
  const { address } = useAccount();
  
  // Check if user is the market creator
  const isCreator = address && creator && address.toLowerCase() === creator.toLowerCase();
  const [yesAmount, setYesAmount] = useState('');
  const [noAmount, setNoAmount] = useState('');
  const queryClient = useQueryClient();

  // Read user's existing bet to enforce one-side-only rule
  const { data: userBet } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'getUserBet',
    args: [BigInt(marketId), address!],
    query: {
      enabled: !!address && isOpen,
    },
  }) as { data: Bet | undefined };

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Determine which side user has already bet on (if any)
  const hasBetYes = userBet && userBet.yesAmount > BigInt(0);
  const hasBetNo = userBet && userBet.noAmount > BigInt(0);
  const userSide = hasBetYes ? 'yes' : hasBetNo ? 'no' : null;

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
          <p className="text-white font-bold">This market is no longer accepting bets</p>
        </CardContent>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-white font-bold">Connect wallet to place bets</p>
        </CardContent>
      </Card>
    );
  }

  if (isCreator) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Place Your Bet</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="p-4 bg-yellow-500 border-4 border-black mb-4">
            <p className="text-sm text-black font-black uppercase">
              ⚠️ You cannot bet on your own market
            </p>
          </div>
          <p className="text-white font-medium text-sm">
            As the market creator, you've already staked {formatEther(creatorStake)} BNB. 
            You cannot place additional bets on this market.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show current position if user has already bet
  const showCurrentPosition = hasBetYes || hasBetNo;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bet</CardTitle>
        {showCurrentPosition && (
          <p className="text-sm text-white font-bold mt-2">
            You've bet <span className="font-black uppercase">{userSide?.toUpperCase()}</span>
            {hasBetYes && ` (${formatEther(userBet.yesAmount)} BNB)`}
            {hasBetNo && ` (${formatEther(userBet.noAmount)} BNB)`}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bet YES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black uppercase text-green-400">Bet YES</h4>
            <span className="text-sm text-white font-bold">
              Pool: {formatEther(yesPool)} BNB
            </span>
          </div>
          {hasBetNo && (
            <div className="p-3 bg-yellow-500 border-4 border-black text-xs text-black font-black uppercase">
              You've already bet NO. You can only bet on one side.
            </div>
          )}
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder={hasBetYes ? "Add more to YES" : "0.0 BNB"}
            value={yesAmount}
            onChange={(e) => setYesAmount(e.target.value)}
            disabled={hasBetNo}
          />
          {yesAmount && parseFloat(yesAmount) > 0 && (
            <p className="text-sm text-white font-bold">
              Potential return: <span className="font-black">
                {calculatePotentialReturn(yesAmount, yesPool, 'yes')} BNB
              </span>
            </p>
          )}
          <Button 
            onClick={handleBetYes}
            disabled={isPending || isConfirming || !yesAmount || parseFloat(yesAmount) <= 0 || hasBetNo}
            className="w-full"
            variant="primary"
          >
            {isPending || isConfirming ? 'Confirming...' : hasBetYes ? 'Add to YES' : 'Bet YES'}
          </Button>
        </div>

        <div className="border-t-4 border-black" />

        {/* Bet NO */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black uppercase text-red-400">Bet NO</h4>
            <span className="text-sm text-white font-bold">
              Pool: {formatEther(noPool)} BNB
            </span>
          </div>
          {hasBetYes && (
            <div className="p-3 bg-yellow-500 border-4 border-black text-xs text-black font-black uppercase">
              You've already bet YES. You can only bet on one side.
            </div>
          )}
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder={hasBetNo ? "Add more to NO" : "0.0 BNB"}
            value={noAmount}
            onChange={(e) => setNoAmount(e.target.value)}
            disabled={hasBetYes}
          />
          {noAmount && parseFloat(noAmount) > 0 && (
            <p className="text-sm text-white font-bold">
              Potential return: <span className="font-black">
                {calculatePotentialReturn(noAmount, noPool, 'no')} BNB
              </span>
            </p>
          )}
          <Button 
            onClick={handleBetNo}
            disabled={isPending || isConfirming || !noAmount || parseFloat(noAmount) <= 0 || hasBetYes}
            className="w-full"
            variant="danger"
          >
            {isPending || isConfirming ? 'Confirming...' : hasBetNo ? 'Add to NO' : 'Bet NO'}
          </Button>
        </div>

        {isSuccess && (
          <div className="p-3 bg-green-500 border-4 border-black">
            <p className="text-sm text-white font-black uppercase">
              ✓ Bet placed successfully!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


