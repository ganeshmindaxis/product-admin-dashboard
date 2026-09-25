'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';
import { LogOut, PackageCheck, User as UserIcon, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addedProducts, updatedProducts, deletedIds, resetLocalState } = useProductContext();

  const totalCustomChanges = addedProducts.length + Object.keys(updatedProducts).length + deletedIds.length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link href="/products" className="flex items-center gap-2 text-indigo-400 font-bold text-xl hover:opacity-90 transition">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <span className="tracking-tight text-white">
              Product<span className="text-indigo-400">Hub</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Admin
            </span>
          </Link>

          {/* User Controls & Logout */}
          <div className="flex items-center gap-3">
            {totalCustomChanges > 0 && (
              <button
                onClick={resetLocalState}
                title="Reset session overlay modifications to original DummyJSON state"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Changes ({totalCustomChanges})
              </button>
            )}

            {user && (
              <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/80">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                    {user.firstName ? user.firstName.charAt(0) : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-200 hidden md:inline">
                  {user.firstName || user.username}
                </span>
              </div>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
