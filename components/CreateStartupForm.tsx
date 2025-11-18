'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { MILESTONE_PREDICTION_ADDRESS, MILESTONE_PREDICTION_ABI } from '@/lib/web3/contracts';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';

const CATEGORIES = ['AI/ML', 'DeFi', 'Infrastructure', 'Gaming', 'Social', 'Enterprise', 'Healthcare', 'Other'];
const STAGES = ['Idea', 'MVP', 'Seed', 'Series A', 'Series B', 'Series C', 'Public', 'Other'];

export function CreateStartupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    stage: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash,
  });

  useEffect(() => {
    if (!isSuccess) return;
    // Invalidate queries to refresh startups list
    queryClient.invalidateQueries();
    const timeout = setTimeout(() => router.push('/startups'), 2000);
    return () => clearTimeout(timeout);
  }, [isSuccess, router, queryClient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.stage) {
      newErrors.stage = 'Stage is required';
    }
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    writeContract({
      address: MILESTONE_PREDICTION_ADDRESS,
      abi: MILESTONE_PREDICTION_ABI,
      functionName: 'createStartup',
      args: [
        formData.name,
        formData.description,
        formData.category,
        formData.stage,
        formData.website || '',
      ],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Startup</CardTitle>
        <p className="text-sm text-white mt-2 font-medium">
          Register your startup on-chain to create markets for your milestones.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Startup Name"
            placeholder="Acme Inc."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe your startup, what you're building, and your mission..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-bold mb-2 text-white">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 border-4 border-black bg-background text-foreground font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.category ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1 font-medium">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-white">
              Stage <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className={`w-full px-4 py-2 border-4 border-black bg-background text-foreground font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.stage ? 'border-red-500' : ''
              }`}
              required
            >
              <option value="">Select a stage</option>
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            {errors.stage && (
              <p className="text-red-500 text-sm mt-1 font-medium">{errors.stage}</p>
            )}
          </div>

          <Input
            label="Website (Optional)"
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            error={errors.website}
          />

          <div className="p-4 bg-blue-500 border-4 border-black">
            <p className="text-sm text-white font-bold">
              💡 <strong>Tip:</strong> Once created, your startup will be stored on-chain permanently. 
              You can then create markets linked to this startup.
            </p>
          </div>

          <Button 
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full"
            size="lg"
          >
            {isPending || isConfirming ? 'Creating Startup...' : 'Create Startup'}
          </Button>

          {isSuccess && (
            <div className="p-4 bg-green-500 border-4 border-black">
              <p className="text-sm text-white font-black uppercase">
                ✓ Startup created successfully! Redirecting...
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

