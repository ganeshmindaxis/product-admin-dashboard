'use client';

import React from 'react';
import { Product } from '@/types';
import { Star, Edit3, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface ProductCardGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCardGrid({ products, onEdit, onDelete }: ProductCardGridProps) {
  return (
    <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => {
        const isLowStock = product.stock <= 10;
        const isOutOfStock = product.stock === 0;

        return (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition"
          >
            <div>
              {/* Image & Header */}
              <div className="relative w-full h-44 bg-slate-800 rounded-lg overflow-hidden mb-3 border border-slate-700/50">
                <img
                  src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900/90 text-indigo-300 border border-indigo-500/20 backdrop-blur-sm capitalize">
                  {product.category}
                </span>

                <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/90 text-amber-400 font-bold text-xs px-2 py-1 rounded-md border border-slate-700 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating || 0).toFixed(1)}</span>
                </div>
              </div>

              {/* Title & Brand */}
              <h3 className="font-semibold text-slate-100 text-base line-clamp-1 mb-1">
                <Link href={`/products/${product.id}`} className="hover:text-indigo-400 transition">
                  {product.title}
                </Link>
              </h3>
              <p className="text-xs text-slate-400 mb-3">{product.brand || 'Generic'}</p>

              {/* Price & Stock */}
              <div className="flex items-center justify-between my-2 pt-2 border-t border-slate-800/80">
                <div className="font-bold text-lg text-slate-100">
                  ${Number(product.price).toFixed(2)}
                </div>

                <div>
                  {isOutOfStock ? (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      Out of stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {product.stock} left
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {product.stock} in stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
              <Link
                href={`/products/${product.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </Link>
              <button
                onClick={() => onEdit(product)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => onDelete(product)}
                className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
