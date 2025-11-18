'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ConnectWalletButton } from '@/components/ConnectWallet';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;


  return (
    <header className="border-b-4 border-black bg-background scanline-effect" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold" data-testid="link-home">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-label="Ship or Die logo" className="shrink-0">
              <defs>
                <linearGradient id="sodg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3772FF"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
              <rect x="1.5" y="1.5" width="21" height="21" rx="2" fill="url(#sodg)" stroke="black" strokeWidth="2.5"/>
              <path d="M13.2 3.5L6.8 13.2h4.4l-1.4 7.3 6.4-9.7h-4.3l1.3-7.3z" fill="white"/>
            </svg>
            <span className="hidden sm:inline text-lg font-extrabold tracking-tight whitespace-nowrap">
              Ship or Die
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1" data-testid="nav-main">
            <Link href="/startups" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/startups') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-startups"
              >
                Startups
              </Button>
            </Link>
            <Link href="/markets" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/markets') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-markets"
              >
                Markets
              </Button>
            </Link>
            <Link href="/markets/create" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/markets/create') || isActive('/create') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-create"
              >
                Create Market
              </Button>
            </Link>
            <Link href="/startups/create" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/startups/create') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-create-startup"
              >
                Create Startup
              </Button>
            </Link>
            <Link href="/analytics" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/analytics') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-analytics"
              >
                Analytics
              </Button>
            </Link>
            <Link href="/watchlist" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/watchlist') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-watchlist"
              >
                Watchlist
              </Button>
            </Link>
            <Link href="/admin/markets" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/admin/markets') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-my-markets"
              >
                My Markets
              </Button>
            </Link>
            <Link href="/admin/startups" className="cursor-pointer">
              <Button 
                variant="ghost" 
                className={`font-semibold text-base cursor-pointer ${isActive('/admin/startups') ? 'brutalist-shadow border-2 border-black bg-accent' : ''}`}
                data-testid="link-my-startups"
              >
                My Startups
              </Button>
            </Link>
          </nav>

          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}

