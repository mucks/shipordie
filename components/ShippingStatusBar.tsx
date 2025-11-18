'use client';

import { useState, useEffect } from "react";

interface ShippingStatusBarProps {
  status: 'on-track' | 'warning' | 'delayed' | 'verified';
  progress: number;
  label?: string;
}

export default function ShippingStatusBar({ 
  status, 
  progress,
  label = "Shipping Status"
}: ShippingStatusBarProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'error' | 'success' | 'verified'>('idle');

  useEffect(() => {
    if (status === 'delayed') {
      setAnimationState('error');
      const timer = setTimeout(() => setAnimationState('idle'), 1200);
      return () => clearTimeout(timer);
    } else if (status === 'verified') {
      setAnimationState('success');
      const timer = setTimeout(() => {
        setAnimationState('verified');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'verified':
        return 'bg-accent border-accent';
      case 'on-track':
        return 'bg-primary border-primary';
      case 'warning':
        return 'bg-chart-4 border-chart-4';
      case 'delayed':
        return 'bg-destructive border-destructive';
      default:
        return 'bg-muted border-muted';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'verified':
        return '✓';
      case 'warning':
        return '⚠';
      case 'delayed':
        return '⚠';
      default:
        return '⏱';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verified':
        return 'VERIFIED';
      case 'on-track':
        return 'ON TRACK';
      case 'warning':
        return 'AT RISK';
      case 'delayed':
        return 'MISSED';
      default:
        return 'PENDING';
    }
  };

  return (
    <div className="space-y-1" data-testid="shipping-status-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-muted-foreground">
            {label}
          </span>
        </div>
        <div 
          className={`flex items-center gap-1 px-2 py-1 border-2 border-black text-black font-bold uppercase text-xs ${getStatusColor()} ${
            animationState === 'error' ? 'state-error' : 
            animationState === 'success' ? 'state-success' : 
            animationState === 'verified' ? 'state-verified' : ''
          }`}
          data-testid="status-badge"
        >
          {getIcon()}
          {getStatusText()}
        </div>
      </div>
      
      <div className="relative h-3 bg-muted border-3 border-black overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 border-r-3 border-black status-bar-fill ${getStatusColor()}`}
          style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
          data-testid="progress-fill"
        />
        {status === 'delayed' && (
          <div className="absolute inset-0 bg-destructive/20 animate-pulse" />
        )}
      </div>
    </div>
  );
}

