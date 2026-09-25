'use client';

import React from 'react';
import { Product } from '@/types';
import { Star, Edit3, Trash2, Eye, Layers } from 'lucide-react';
import Link from 'next/link';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-800/80 border-b border-slate-700/80 text-slate-300 font-semibold uppercase text-xs tracking-wider">
            <th className="py-4 px-6">Product</th>
            <th className="py-4 px-4">Category</th>
            <th className="py-4 px-4">Price</th>
            <th className="py-4 px-4">Rating</th>
            <th className="py-4 px-4">Stock</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {products.map((product) => {
            const isLowStock = product.stock <= 10;
            const isOutOfStock = product.stock === 0;

            return (
              <tr key={product.id} className="hover:bg-slate-800/40 transition-colors group">
                {/* Image & Title */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg bg-slate-800 border border-slate-700/60 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.id}`}
                        className="font-semibold text-slate-100 group-hover:text-indigo-400 transition truncate block hover:underline"
                        title={product.title}
                      >
                        {product.title}
                      </Link>
                      <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                        {product.brand || 'Generic'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-indigo-300 border border-indigo-500/20 capitalize">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-100">
                  ${Number(product.price).toFixed(2)}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <span className="ml-1.5 text-xs text-emerald-400 font-normal">
                      -{Math.round(product.discountPercentage)}%
                    </span>
                  )}
                </td>

                {/* Rating */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{Number(product.rating || 0).toFixed(1)}</span>
                  </div>
                </td>

                {/* Stock Status */}
                <td className="py-4 px-4 whitespace-nowrap">
                  {isOutOfStock ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      Out of stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {product.stock} left
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {product.stock} in stock
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
