'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function Hero() {
  return (
    <section className="container mx-auto px-6 py-24 glitch-texture">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* PRO Mini Badge */}
        <Link href="/waitlist" className="inline-block" data-testid="link-hero-pro">
          <Badge className="border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs bg-gradient-to-r from-[#3772FF] to-[#8B5CF6] text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            ⭐ PRO Mode (Beta) — Request Access
          </Badge>
        </Link>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight">
            SHIP OR DIE
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-primary">
            Proof of Execution
          </p>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto" style={{ lineHeight: '1.2' }}>
          Bet on delivery, not promises. Turn startup milestones into transparent, verifiable markets.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/markets">
            <Button 
              size="lg"
              className="border-4 border-black brutalist-shadow-primary font-bold uppercase tracking-wide text-base px-8 py-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              data-testid="button-explore-markets"
            >
              | Explore Markets
            </Button>
          </Link>
          
          <Link href="/markets/create">
            <Button 
              variant="outline"
              size="lg"
              className="border-4 border-black bg-transparent brutalist-shadow font-bold uppercase tracking-wide text-base px-8 py-6 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              data-testid="button-create-market"
            >
              + Create Market
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-xs font-bold uppercase text-muted-foreground pt-2">
          <span>Powered by BNB Chain</span>
          <span>•</span>
          <span>Transparent</span>
          <span>•</span>
          <span>Verifiable</span>
        </div>
      </div>
    </section>
  );
}

