'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Startup } from '@/lib/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { DatePicker } from './ui/DatePicker';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';

export function CreateMarketForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startupId: '',
    deadline: '',
    stake: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Read total startup count
  const { data: startupCount } = useReadContract({
    address: MILESTONE_PREDICTION_ADDRESS,
    abi: MILESTONE_PREDICTION_ABI,
    functionName: 'startupCount',
  });

  const totalStartups = Number(startupCount ?? BigInt(0));

  // Create contracts array for batch reading startups
  const startupContracts = useMemo(() => {
    return Array.from({ length: totalStartups }, (_, i) => ({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'getStartup' as const,
      args: [BigInt(i)] as const,
    }));
  }, [totalStartups]);

  // Batch read all startups
  const { data: startupsData } = useReadContracts({
    contracts: startupContracts,
    query: {
      enabled: totalStartups > 0,
    },
  });

  // Map results to startup objects
  const startups: { id: number; data: Startup | undefined }[] = useMemo(() => {
    if (!startupsData) return [];
    return startupsData.map((result, i) => ({
      id: i,
      data: result.status === 'success' ? (result.result as Startup) : undefined,
    }));
  }, [startupsData]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
  });

  useEffect(() => {
    if (!isSuccess) return;
    // Invalidate queries to refresh markets list
    queryClient.invalidateQueries();
    const timeout = setTimeout(() => router.push('/markets'), 2000);
    return () => clearTimeout(timeout);
  }, [isSuccess, router, queryClient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      if (deadlineDate <= new Date()) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    if (!formData.stake || parseFloat(formData.stake) <= 0) {
      newErrors.stake = 'Stake must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create metadata JSON
    const metadata = {
      title: formData.title,
      description: formData.description,
    };

    const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
    const startupId = formData.startupId ? BigInt(formData.startupId) : BigInt(0);

    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'createMarket',
      args: [BigInt(deadlineTimestamp), JSON.stringify(metadata), startupId],
      value: parseEther(formData.stake),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Milestone Market</CardTitle>
        <p className="text-sm text-white mt-2 font-medium">
          Create a prediction market for your startup milestone. Stake BNB to show your commitment.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Milestone Title"
            placeholder="Ship AI Copilot v1"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            required
          />

          <Textarea
            label="Description"
            placeholder="Detailed description of the milestone and success criteria..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-bold mb-2 text-white">
              Startup (Optional)
            </label>
            <select
              value={formData.startupId}
              onChange={(e) => setFormData({ ...formData, startupId: e.target.value })}
              className="w-full px-4 py-2 border-4 border-black bg-background text-foreground font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">None - Create market without startup</option>
              {startups.map((startup) => {
                if (!startup.data) return null;
                return (
                  <option key={startup.id} value={startup.id}>
                    {startup.data.name} ({startup.data.category})
                  </option>
                );
              })}
            </select>
            {totalStartups === 0 && (
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                No startups created yet. <a href="/startups/create" className="text-primary underline font-bold">Create one here</a>.
              </p>
            )}
          </div>

          <DatePicker
            label="Deadline"
            value={formData.deadline}
            onChange={(value) => setFormData({ ...formData, deadline: value })}
            error={errors.deadline}
            required
            min={new Date().toISOString().slice(0, 16)}
          />

          <Input
            label="Your Stake (BNB)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.1"
            value={formData.stake}
            onChange={(e) => setFormData({ ...formData, stake: e.target.value })}
            error={errors.stake}
            required
          />

          <div className="p-4 bg-blue-500 border-4 border-black">
            <p className="text-sm text-white font-bold">
              💡 <strong>Tip:</strong> Your stake shows commitment and is added to the prize pool. 
              Higher stakes attract more participants.
            </p>
          </div>

          <Button 
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full"
            size="lg"
          >
            {isPending || isConfirming ? 'Creating Market...' : 'Create Market'}
          </Button>

          {isSuccess && (
            <div className="p-4 bg-green-500 border-4 border-black">
              <p className="text-sm text-white font-black uppercase">
                ✓ Market created successfully! Redirecting...
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


