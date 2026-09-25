'use client';

import React, { useState, useEffect, use } from 'react';
import { Product } from '@/types';
import { productsApi } from '@/services/api';
import { useProductContext } from '@/context/ProductContext';
import ProtectedLayout from '@/components/ProtectedLayout';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  PackageX,
  Tag,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { applyLocalOverlayToItem, addedProducts } = useProductContext();

  useEffect(() => {
    if (isNaN(productId) || productId <= 0) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);
    setError(null);

    // Check if the product was locally added first
    const localAdded = addedProducts.find((p) => p.id === productId);
    if (localAdded) {
      const merged = applyLocalOverlayToItem(localAdded);
      if (!merged) {
        setNotFound(true);
      } else {
        setProduct(merged);
        setSelectedImage(merged.thumbnail || merged.images?.[0] || '');
      }
      setIsLoading(false);
      return;
    }

    // Fetch from DummyJSON API using Axios
    productsApi
      .getProductById(productId)
      .then((data) => {
        if (!isMounted) return;
        const merged = applyLocalOverlayToItem(data);
        if (!merged) {
          setNotFound(true);
        } else {
          setProduct(merged);
          setSelectedImage(merged.thumbnail || merged.images?.[0] || '');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
          setNotFound(true);
        } else {
          setError(err.message || 'Failed to fetch product details.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, applyLocalOverlayToItem, addedProducts]);

  return (
    <ProtectedLayout>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation Button */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products List
          </Link>

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
              <p className="text-slate-300 font-semibold text-base">Loading Product Details...</p>
              <p className="text-xs text-slate-500 mt-1">Fetching specs, gallery & customer reviews</p>
            </div>
          ) : notFound ? (
            /* Not Found Page for Wrong ID */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
                <PackageX className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">404 - Product Not Found</h1>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                The product with ID <code className="text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded">{resolvedParams.id}</code> does not exist or has been deleted.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : error ? (
            /* General Error State */
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-12 text-center shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Error Loading Product</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-slate-800 text-slate-100 hover:bg-slate-700 font-medium text-sm rounded-xl border border-slate-700 transition"
              >
                Reload Page
              </button>
            </div>
          ) : product ? (
            /* Product Details Content */
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Left Column: Image Gallery */}
                <div className="space-y-4">
                  <div className="relative w-full h-80 sm:h-96 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner">
                    <img
                      src={selectedImage || product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        -{Math.round(product.discountPercentage)}% OFF
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Selector Row */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {product.images.map((img, idx) => (
                        <button
                          key={`img-${idx}`}
                          onClick={() => setSelectedImage(img)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition flex-shrink-0 ${
                            selectedImage === img
                              ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                              : 'border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Specifications & Meta */}
                <div className="flex flex-col justify-between space-y-6">
                  <div>
                    {/* Category & Brand badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                        {product.category}
                      </span>
                      {product.brand && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                      {product.title}
                    </h1>

                    {/* Rating & Stock */}
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{Number(product.rating || 0).toFixed(1)}</span>
                      </div>

                      <span className="text-slate-500">•</span>

                      {product.stock === 0 ? (
                        <span className="text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          {product.stock} items in stock
                        </span>
                      )}
                    </div>

                    {/* Price Section */}
                    <div className="flex items-baseline gap-3 my-4">
                      <span className="text-3xl font-black text-white">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.discountPercentage && product.discountPercentage > 0 && (
                        <span className="text-base text-slate-500 line-through">
                          ${(product.price / (1 - product.discountPercentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                      {product.description}
                    </p>
                  </div>

                  {/* Highlights & Guarantees */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span>{product.warrantyInformation || '1 Year Standard Warranty'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl text-slate-300">
                      <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{product.shippingInformation || 'Free Global Shipping'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl text-slate-300">
                      <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{product.returnPolicy || '30-Day Money Back'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Customer Reviews ({product.reviews?.length || 0})
                </h2>

                {product.reviews && product.reviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.reviews.map((rev, idx) => (
                      <div
                        key={`review-${idx}`}
                        className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-xs font-bold">
                              {rev.reviewerName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-slate-200">
                                {rev.reviewerName}
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                {new Date(rev.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {rev.rating}
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 italic">&quot;{rev.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No customer reviews yet for this product.</p>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </ProtectedLayout>
  );
}
