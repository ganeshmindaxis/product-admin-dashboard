'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Filter, ArrowUpDown, Info } from 'lucide-react';
import { SortField, SortOrder } from '@/types';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: Array<{ slug: string; name: string }>;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onOpenAddModal: () => void;
}

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  sortBy,
  sortOrder,
  onSortChange,
  onOpenAddModal,
}: SearchAndFilterProps) {
  const [localInput, setLocalInput] = useState(searchTerm);

  // Sync internal state when external search query (from URL) changes
  useEffect(() => {
    setLocalInput(searchTerm);
  }, [searchTerm]);

  // Debounce search input typing (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localInput !== searchTerm) {
        onSearchChange(localInput);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [localInput, searchTerm, onSearchChange]);

  const handleClearSearch = () => {
    setLocalInput('');
    onSearchChange('');
  };

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'none') {
      onSortChange('none', 'asc');
      return;
    }
    const [field, order] = val.split('-') as [SortField, SortOrder];
    onSortChange(field, order);
  };

  const currentSortValue = sortBy === 'none' ? 'none' : `${sortBy}-${sortOrder}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-lg space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Search products by title, brand..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          {localInput && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters & Actions Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize cursor-pointer transition"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={currentSortValue}
              onChange={handleSortSelect}
              className="w-full sm:w-48 pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition"
            >
              <option value="none">Sort by: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest First</option>
              <option value="rating-asc">Rating: Lowest First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
          </div>

          {/* Add Product Button */}
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Edge Case Note Badge if both search & category are active */}
      {searchTerm && category !== 'all' && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
          <Info className="w-4 h-4 flex-shrink-0 text-indigo-400" />
          <span>
            <strong>Note:</strong> Search is active. Results matching <em>&quot;{searchTerm}&quot;</em> are filtered client-side by category <em>&quot;{category}&quot;</em> because DummyJSON API restricts combined backend search and category filtering.
          </span>
        </div>
      )}
    </div>
  );
}
