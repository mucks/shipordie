'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseEther } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';

export function CreateMarketForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startupName: '',
    deadline: '',
    stake: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      startupName: formData.startupName || undefined,
    };

    const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'createMarket',
      args: [BigInt(deadlineTimestamp), JSON.stringify(metadata)],
      value: parseEther(formData.stake),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Milestone Market</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
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

          <Input
            label="Startup Name (Optional)"
            placeholder="Acme Inc."
            value={formData.startupName}
            onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
          />

          <Input
            label="Deadline"
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            error={errors.deadline}
            required
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

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
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
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Market created successfully! Redirecting...
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}


