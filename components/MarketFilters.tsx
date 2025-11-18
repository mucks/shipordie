'use client';

import { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { MarketCategory, DeliveryStatus, MarketState } from '@/lib/types';

export type FilterType = 'all' | 'verified' | 'ending-soon' | 'highest-stake' | 'new';
export type SortType = 'deadline' | 'market-cap' | 'participants' | 'confidence';

interface MarketFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  selectedCategory?: MarketCategory;
  onCategoryChange: (category?: MarketCategory) => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'highest-stake', label: 'Highest Stake' },
  { value: 'new', label: 'New' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'market-cap', label: 'Market Cap' },
  { value: 'participants', label: 'Participants' },
  { value: 'confidence', label: 'Confidence' },
];

const CATEGORIES: MarketCategory[] = [
  'AI',
  'DeFi',
  'FoodTech',
  'RWA',
  'Web3',
  'Gaming',
  'Infrastructure',
  'Social',
  'Enterprise',
  'Other',
];

export function MarketFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
}: MarketFiltersProps) {
  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <div>
        <Input
          type="text"
          placeholder="Search markets..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-5 py-2 text-sm font-black uppercase tracking-wide border-4 border-black transition-all ${
              activeFilter === filter.value
                ? 'bg-blue-500 text-white neobrutal-shadow'
                : 'bg-[#2a2a2a] text-white hover:bg-[#333333] neobrutal-shadow-sm hover:neobrutal-shadow'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-black uppercase text-white mr-2">Categories:</span>
        <button
          onClick={() => onCategoryChange(undefined)}
          className={`px-4 py-1.5 text-xs font-black uppercase tracking-wide border-2 border-black transition-all ${
            !selectedCategory
              ? 'bg-blue-500 text-white'
              : 'bg-[#2a2a2a] text-white hover:bg-[#333333]'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-wide border-2 border-black transition-all ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-[#2a2a2a] text-white hover:bg-[#333333]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-black uppercase text-white">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortType)}
          className="px-4 py-2 border-4 border-black bg-[#2a2a2a] text-white text-sm font-bold uppercase focus:outline-none focus:bg-[#333333]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

