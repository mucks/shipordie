'use client';

import { CreateMarketForm } from '@/components/CreateMarketForm';

export default function CreateMarketPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-[#1a1a1a]">
      <div className="mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tight text-white mb-2">Create Milestone Market</h1>
        <p className="text-white font-bold text-lg">
          Set up a prediction market for your startup milestone and stake BNB to show commitment.
        </p>
      </div>

      <CreateMarketForm />
    </div>
  );
}


