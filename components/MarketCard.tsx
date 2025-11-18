'use client';

import Link from 'next/link';
import { formatEther } from 'viem';
import { Market, MarketState, MarketMetadata, DeliveryStatus } from '@/lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import ShippingStatusBar from './ShippingStatusBar';
import ConfidenceSparkline from './ConfidenceSparkline';
import { useState, useEffect } from 'react';
import { toTitleCase, formatCompactNumber } from '@/lib/formatters';

interface MarketCardProps {
  marketId: number;
  market: Market;
  participantCount?: number;
}

export function MarketCard({ marketId, market, participantCount }: MarketCardProps) {
  const [isWatched, setIsWatched] = useState(false);

  // Parse metadata
  let metadata: MarketMetadata = { title: 'Untitled', description: '' };
  try {
    metadata = JSON.parse(market.metadataURI);
  } catch {
    // Use metadataURI as title if not JSON
    metadata.title = market.metadataURI;
  }

  const totalPool = market.yesPool + market.noPool + market.creatorStake;
  const deadline = new Date(Number(market.deadline) * 1000);
  const isExpired = deadline < new Date();
  const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Calculate percentages
  const yesPercentage = totalPool > BigInt(0) 
    ? Math.round((Number(market.yesPool) / Number(totalPool)) * 100) 
    : 50;
  const noPercentage = totalPool > BigInt(0) 
    ? Math.round((Number(market.noPool) / Number(totalPool)) * 100) 
    : 50;

  const finalParticipantCount = participantCount ?? metadata.participants ?? 0;

  // Determine shipping status
  const getShippingStatus = (): 'on-track' | 'warning' | 'delayed' | 'verified' => {
    if (market.state === MarketState.Resolved) {
      return market.winningSide === 1 ? 'verified' : 'delayed';
    }
    
    if (isExpired) return 'delayed';
    if (daysUntilDeadline <= 30) return 'warning';
    if (yesPercentage < 50) return 'warning';
    return 'on-track';
  };

  const getShippingProgress = (): number => {
    if (market.state === MarketState.Resolved) {
      return market.winningSide === 1 ? 100 : 0;
    }
    return yesPercentage;
  };

  const shippingStatus = getShippingStatus();
  const shippingProgress = getShippingProgress();

  useEffect(() => {
    const watchedMarkets = JSON.parse(localStorage.getItem('watchedMarkets') || '[]');
    setIsWatched(watchedMarkets.includes(marketId.toString()));
  }, [marketId]);

  const toggleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const watchedMarkets = JSON.parse(localStorage.getItem('watchedMarkets') || '[]');
    let newWatchedMarkets;
    
    if (isWatched) {
      newWatchedMarkets = watchedMarkets.filter((id: string) => id !== marketId.toString());
    } else {
      newWatchedMarkets = [...watchedMarkets, marketId.toString()];
    }
    
    localStorage.setItem('watchedMarkets', JSON.stringify(newWatchedMarkets));
    setIsWatched(!isWatched);
  };

  const accentColor = 'primary';
  const shadowClass = 'brutalist-shadow-primary';
  const badgeColor = '';

  const getButtonVariantAndText = () => {
    if (shippingStatus === 'delayed') {
      return { variant: 'danger' as const, text: 'CLOSED', disabled: true, className: '' };
    }
    if (shippingStatus === 'warning') {
      return { 
        variant: 'outline' as const, 
        text: 'PLACE BET', 
        disabled: false, 
        className: 'bg-chart-4 text-black border-4 border-chart-4 hover:bg-chart-4/90 active:bg-chart-4/80' 
      };
    }
    return { variant: 'primary' as const, text: 'PLACE BET', disabled: false, className: '' };
  };

  const buttonConfig = getButtonVariantAndText();

  const getHoverEffect = () => {
    if (shippingStatus === 'on-track' || shippingStatus === 'warning') {
      return 'hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]';
    }
    return 'hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatStake = (amount: bigint): string => {
    return `${formatCompactNumber(Number(formatEther(amount)))} BNB`;
  };

  return (
    <Link href={`/markets/${marketId}`} className="block h-full">
      <div 
        className={`bg-card border-4 border-black ${shadowClass} p-6 space-y-4 transition-all ${getHoverEffect()} glitch-texture pixel-offset relative overflow-hidden h-full flex flex-col`}
        data-testid="card-market"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl font-bold leading-tight" data-testid="text-market-title">
              {toTitleCase(metadata.title)}
            </h3>
            <p className="text-muted-foreground font-medium" data-testid="text-market-description">
              {metadata.startupName || metadata.description}
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <Badge 
              className={`border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs px-3 py-1 ${badgeColor}`}
              data-testid="badge-proof-type"
            >
              {metadata.category || 'GENERAL'}
            </Badge>
            <button
              onClick={toggleWatch}
              className={`h-8 w-8 border-3 border-black flex items-center justify-center ${isWatched ? 'bg-primary text-primary-foreground' : ''}`}
              data-testid="button-watch"
            >
              {isWatched ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y-4 border-black">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase">
              📅 Deadline
            </div>
            <div className="font-bold text-sm" data-testid="text-deadline">{formatDate(deadline)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase">
              📈 Total Stake
            </div>
            <div className="font-bold text-sm" data-testid="text-total-bets">{formatStake(totalPool)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase">
              👥 Participants
            </div>
            <div className="font-bold text-sm" data-testid="text-participants">{formatCompactNumber(finalParticipantCount)}</div>
          </div>
        </div>

        <ShippingStatusBar 
          status={shippingStatus}
          progress={shippingProgress}
          label="Delivery Status"
        />

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase text-muted-foreground">YES</div>
              <div className="text-3xl font-black text-accent" data-testid="text-yes-price">
                {yesPercentage}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase text-muted-foreground">NO</div>
              <div className="text-3xl font-black text-destructive" data-testid="text-no-price">
                {noPercentage}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-muted-foreground">Confidence Trend</span>
              <ConfidenceSparkline />
            </div>
            {daysUntilDeadline > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground" data-testid="text-verification-days">
                ⏱
                <span>Next verification in {daysUntilDeadline} {daysUntilDeadline === 1 ? 'day' : 'days'}</span>
              </div>
            )}
          </div>
          
          <div className="relative h-8 bg-muted border-4 border-black overflow-hidden" data-testid="bar-yes-no">
            <div 
              className="absolute left-0 top-0 h-full bg-accent border-r-4 border-black flex items-center justify-start pl-2 font-bold text-xs text-white transition-all"
              style={{ width: `${yesPercentage}%` }}
            >
              {yesPercentage > 15 && `${yesPercentage}% YES`}
            </div>
            <div 
              className="absolute right-0 top-0 h-full bg-destructive flex items-center justify-end pr-2 font-bold text-xs text-white transition-all"
              style={{ width: `${noPercentage}%` }}
            >
              {noPercentage > 15 && `${noPercentage}% NO`}
            </div>
          </div>
        </div>

        <Button 
          variant={buttonConfig.variant}
          disabled={buttonConfig.disabled}
          className={`w-full ${shippingStatus === 'warning' ? '' : 'border-4 border-black'} brutalist-shadow font-bold uppercase tracking-wide text-sm py-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${buttonConfig.className} mt-auto`}
          data-testid="button-place-bet"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            window.location.href = `/markets/${marketId}`;
          }}
        >
          {buttonConfig.text}
        </Button>
      </div>
    </Link>
  );
}

