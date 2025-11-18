'use client';

import { Badge } from "@/components/ui/Badge";
import { useEffect, useRef, useState } from "react";

interface StartupLeaderboardItem {
  rank: number;
  name: string;
  category: string;
  totalStake: string;
  marketsWon: number;
  winRate: number;
  verified: boolean;
}

const topStartups: StartupLeaderboardItem[] = [
  {
    rank: 1,
    name: "Ship or Die",
    category: "DEFI",
    totalStake: "5.1M BNB",
    marketsWon: 8,
    winRate: 99,
    verified: true,
  },
  {
    rank: 2,
    name: "Stripe",
    category: "FINTECH",
    totalStake: "162K BNB",
    marketsWon: 5,
    winRate: 83,
    verified: true,
  },
  {
    rank: 3,
    name: "OpenAI",
    category: "AI/ML",
    totalStake: "155K BNB",
    marketsWon: 4,
    winRate: 80,
    verified: false,
  },
];

function getRankColor(rank: number): string {
  if (rank === 1) return "bg-yellow-500 border-yellow-700 text-white";
  if (rank === 2) return "bg-gray-400 border-gray-600 text-white";
  if (rank === 3) return "bg-orange-600 border-orange-800 text-white";
  return "bg-muted border-muted-foreground/20";
}

export default function TopStartups() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="container mx-auto px-6 py-16" data-testid="section-top-startups">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          Top Performing Startups
        </h2>
        <p className="text-xl text-muted-foreground font-medium">
          Startups with the best track record of delivering on promises
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {topStartups.map((startup, index) => (
          <div
            key={startup.name}
            className={`bg-card border-4 border-black brutalist-shadow-md p-6 space-y-4 relative ${
              isVisible ? "animate-slide-up" : ""
            }`}
            style={{
              animationDelay: isVisible ? `${index * 0.15}s` : undefined,
            }}
            data-testid={`card-leaderboard-${startup.rank}`}
          >
            {/* Rank Badge */}
            <div className="absolute -top-4 -left-4">
              <div
                className={`h-12 w-12 border-4 border-black flex items-center justify-center ${getRankColor(
                  startup.rank
                )}`}
              >
                🏆
              </div>
            </div>

            {/* Verified Badge with Animation */}
            {startup.verified && (
              <div
                className={`absolute -top-4 -right-4 ${isVisible ? "animate-verified-pulse" : ""}`}
                style={{
                  animationDelay: isVisible ? "1s" : undefined,
                }}
              >
                <Badge
                  className="border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs bg-green-500 text-white flex items-center gap-1"
                  data-testid="badge-verified"
                >
                  ✓
                  Verified
                </Badge>
              </div>
            )}

            {/* Startup Info */}
            <div className="pt-8">
              <h3 className="text-2xl font-black mb-2" data-testid="text-startup-name">
                {startup.name}
              </h3>
              <Badge
                className="border-3 border-black brutalist-shadow-sm font-bold uppercase text-xs"
                data-testid="badge-category"
              >
                {startup.category}
              </Badge>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t-2 border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground uppercase">
                  Total Stake
                </span>
                <span className="text-lg font-black">{startup.totalStake}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground uppercase">
                  Markets Won
                </span>
                <span className="text-lg font-black">{startup.marketsWon}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  📈
                  Win Rate
                </span>
                <span className="text-lg font-black text-green-500">{startup.winRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

