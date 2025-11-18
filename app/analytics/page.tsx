'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Analytics() {
  const stats = [
    {
      label: "Average Delivery Rate",
      value: "68%",
      icon: "🎯",
      color: "text-green-600",
    },
    {
      label: "Market Accuracy",
      value: "73%",
      icon: "📈",
      color: "text-blue-600",
    },
    {
      label: "Active Markets",
      value: "47",
      icon: "📊",
      color: "text-purple-600",
    },
    {
      label: "Total Participants",
      value: "2.3K",
      icon: "👥",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="max-w-4xl mb-16">
            <h1 
              className="text-5xl md:text-6xl font-black mb-6"
              data-testid="heading-analytics"
            >
              Analytics
            </h1>
            <p 
              className="text-xl md:text-2xl text-muted-foreground font-bold mb-6"
              data-testid="text-subheadline"
            >
              Track performance, market sentiment, and milestone reliability.
            </p>
            <p 
              className="text-lg text-muted-foreground font-medium leading-relaxed"
              data-testid="text-description"
            >
              Get insights into startup execution trends, market accuracy, and community participation. Data-driven decisions start here.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card 
                key={index}
                className="bg-card border-4 border-black brutalist-shadow-md p-6"
                data-testid={`card-stat-${index}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`text-4xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold uppercase text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className={`text-4xl font-black ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card 
              className="bg-card border-4 border-black brutalist-shadow-md p-8"
              data-testid="card-chart-1"
            >
              <h3 className="text-2xl font-black mb-6">Market Performance</h3>
              <div className="h-64 bg-muted border-4 border-black flex items-center justify-center">
                <p className="text-muted-foreground font-medium">Chart coming soon</p>
              </div>
            </Card>

            <Card 
              className="bg-card border-4 border-black brutalist-shadow-md p-8"
              data-testid="card-chart-2"
            >
              <h3 className="text-2xl font-black mb-6">Delivery Trends</h3>
              <div className="h-64 bg-muted border-4 border-black flex items-center justify-center">
                <p className="text-muted-foreground font-medium">Chart coming soon</p>
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="bg-card border-4 border-black brutalist-shadow-md p-8 max-w-2xl mx-auto">
              <h3 className="text-3xl font-black mb-4">Ready to dive deeper?</h3>
              <p className="text-muted-foreground font-medium mb-6">
                Explore active markets and start tracking your favorite startups.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/markets">
                  <Button className="border-4 border-black brutalist-shadow font-bold uppercase">
                    Browse Markets
                  </Button>
                </Link>
                <Link href="/markets/create">
                  <Button variant="outline" className="border-4 border-black brutalist-shadow font-bold uppercase">
                    Create Market
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

