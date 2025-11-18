'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface WaitlistEntry {
  id: number;
  name: string;
  email: string;
  wallet_address: string | null;
  role: string;
  features: string[] | null;
  will_pay: string;
  additional_info: string | null;
  created_at: string;
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/admin/waitlist');
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch waitlist entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <p className="text-white font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight text-white mb-2">
              Waitlist Entries
            </h1>
            <p className="text-white font-bold text-lg">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/markets">
              <Button variant="outline">Markets Admin</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500 border-4 border-black neobrutal-shadow">
            <p className="text-white font-black uppercase">{error}</p>
          </div>
        )}

        {entries.length === 0 ? (
          <Card className="p-12 text-center border-4 border-black neobrutal-shadow">
            <p className="text-2xl font-black uppercase text-white mb-4">No entries yet</p>
            <p className="text-gray-300 font-medium">
              Waitlist entries will appear here once users submit the form.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-6 border-4 border-black neobrutal-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase text-gray-400 mb-1">Name</p>
                    <p className="text-white font-medium">{entry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-gray-400 mb-1">Email</p>
                    <p className="text-white font-medium">{entry.email}</p>
                  </div>
                  {entry.wallet_address && (
                    <div>
                      <p className="text-sm font-bold uppercase text-gray-400 mb-1">Wallet</p>
                      <p className="text-white font-medium font-mono text-sm">{entry.wallet_address}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold uppercase text-gray-400 mb-1">Role</p>
                    <p className="text-white font-medium capitalize">{entry.role.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-gray-400 mb-1">Will Pay</p>
                    <p className="text-white font-medium capitalize">{entry.will_pay}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-gray-400 mb-1">Joined</p>
                    <p className="text-white font-medium">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {entry.features && entry.features.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-bold uppercase text-gray-400 mb-1">Interested Features</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-blue-500 border-2 border-black text-white text-xs font-bold uppercase"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.additional_info && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-bold uppercase text-gray-400 mb-1">Additional Info</p>
                      <p className="text-white font-medium">{entry.additional_info}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

