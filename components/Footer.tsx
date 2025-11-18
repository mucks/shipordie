'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default function Footer() {
  return (
    <footer className="border-t-4 border-black bg-card mt-24">
      <div className="container mx-auto px-6 py-12">
        {/* PRO Waitlist Teaser */}
        <div className="mb-12 p-6 border-4 border-black brutalist-shadow bg-gradient-to-r from-[#3772FF]/10 to-[#8B5CF6]/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className="border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs bg-primary text-primary-foreground">
                ⭐ PRO Coming Soon
              </Badge>
              <span className="text-sm font-bold text-muted-foreground">•</span>
              <Link href="/waitlist" className="text-sm font-bold text-foreground hover:text-primary transition-colors" data-testid="link-pro-waitlist">
                Join Waitlist →
              </Link>
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center md:text-right">
              Smarter Predictions. Deeper Insights. Higher Returns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-black group cursor-pointer transition-all" data-testid="footer-logo">
              <span className="group-hover:text-primary group-hover:drop-shadow-[0_0_8px_rgba(55,114,255,0.6)] transition-all duration-200">
                Ship or Die
              </span>
            </h3>
            <p className="text-muted-foreground font-medium text-sm">
              Proof of Execution for startups.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase">Markets</h4>
            <ul className="space-y-2">
              <li><Link href="/markets" className="text-muted-foreground hover:text-foreground font-medium text-sm">Browse All</Link></li>
              <li><Link href="/markets/create" className="text-muted-foreground hover:text-foreground font-medium text-sm">Create Market</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase">Social</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://x.com/0xShipordie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground font-medium text-sm inline-flex items-center gap-2"
                  data-testid="link-twitter"
                >
                  <span>𝕏</span>
                  X
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/mucks/shipordie" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground font-medium text-sm inline-flex items-center gap-2"
                  data-testid="link-github"
                >
                  <span>⚡</span>
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t-4 border-black mt-12 pt-8">
          <p className="text-center text-muted-foreground font-bold text-sm uppercase leading-relaxed" data-testid="text-copyright">
            © 2025 SHIP OR DIE. PROOF OF EXECUTION.<br />
            BUILT FOR TRANSPARENT ACCOUNTABILITY.
          </p>
        </div>
      </div>
    </footer>
  );
}

