'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Product, SortField, SortOrder } from '@/types';
import { productsApi } from '@/services/api';
import { useProductContext } from '@/context/ProductContext';
import ProtectedLayout from '@/components/ProtectedLayout';
import Navbar from '@/components/Navbar';
import ProductTable from '@/components/ProductTable';
import ProductCardGrid from '@/components/ProductCardGrid';
import Pagination from '@/components/Pagination';
import SearchAndFilter from '@/components/SearchAndFilter';
import ProductModal from '@/components/ProductModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { Loader2, AlertCircle, RefreshCw, PackageX, Sparkles } from 'lucide-react';

function ProductsDashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params safely with fallback sanitization
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const sortBy = (searchParams.get('sortBy') as SortField) || 'none';
  const order = (searchParams.get('order') as SortOrder) || 'asc';

  // Sanitize numeric inputs (wrong values like ?page=abc or ?page=-5 won't break page)
  const page = Math.max(1, parseInt(rawPage || '1', 10) || 1);
  const limit = [10, 20, 50].includes(parseInt(rawLimit || '10', 10))
    ? parseInt(rawLimit || '10', 10)
    : 10;

  // Local component states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Context for optimistic local overlay
  const {
    addedProducts,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    applyLocalOverlayToList,
  } = useProductContext();

  // Ref to cancel pending Axios request on fast typing / rapid parameter changes
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to update URL params cleanly
  const updateQueryParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all' || value === 'none') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const searchStr = current.toString();
      const query = searchStr ? `?${searchStr}` : '';
      router.push(`${pathname}${query}`);
    },
    [searchParams, router, pathname]
  );

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true;
    productsApi
      .getCategories()
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch((e) => console.error('Failed to load categories:', e));
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products from API with race condition cancellation guard
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Abort previous pending request if any (prevents race condition when typing fast)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const skip = (page - 1) * limit;

      const data = await productsApi.getProducts({
        limit,
        skip,
        search,
        category,
        sortBy,
        order,
        signal: controller.signal,
      });

      // Apply local overlay (updates and deletes)
      let list = applyLocalOverlayToList(data.products);
      let total = data.total;

      // Handle custom client-side category filtering when searching
      if (search && category !== 'all') {
        list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        total = list.length;
      }

      // Handle custom client-side sorting if API doesn't sort search/category results
      if (sortBy !== 'none') {
        list = [...list].sort((a, b) => {
          let valA: any = a[sortBy as keyof Product] ?? '';
          let valB: any = b[sortBy as keyof Product] ?? '';

          if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          if (valA < valB) return order === 'asc' ? -1 : 1;
          if (valA > valB) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Include newly added local products if on page 1 and no search or matching search
      if (page === 1 && addedProducts.length > 0) {
        const matchingAdded = addedProducts.filter((p) => {
          const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
          const matchCat = category === 'all' || p.category.toLowerCase() === category.toLowerCase();
          return matchSearch && matchCat;
        });

        // Prepend added products
        list = [...matchingAdded, ...list];
        total += matchingAdded.length;
      }

      setProducts(list);
      setTotalProducts(total);
    } catch (err: any) {
      // Ignore canceled request errors
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return;
      }
      setError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, category, sortBy, order, applyLocalOverlayToList, addedProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers for URL parameter updates
  const handleSearchChange = (newSearch: string) => {
    updateQueryParams({ search: newSearch, page: 1 }); // Go back to page 1 on search change
  };

  const handleCategoryChange = (newCat: string) => {
    updateQueryParams({ category: newCat, page: 1 }); // Reset to page 1 on category change
  };

  const handleSortChange = (newSortBy: SortField, newOrder: SortOrder) => {
    updateQueryParams({ sortBy: newSortBy, order: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    updateQueryParams({ limit: newSize, page: 1 });
  };

  // CRUD Handlers
  const handleCreateSubmit = async (formData: any) => {
    await handleAddProduct(formData);
    fetchProducts();
  };

  const handleEditSubmit = async (formData: any) => {
    if (!editingProduct) return;
    await handleUpdateProduct(editingProduct.id, formData);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleDeleteConfirm = async (id: number) => {
    await handleDeleteProduct(id);
    setDeletingProduct(null);
    fetchProducts();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Products Catalog
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Search, filter, edit, and manage store items in real time.
            </p>
          </div>
        </div>

        {/* Search, Filter & Controls */}
        <SearchAndFilter
          searchTerm={search}
          onSearchChange={handleSearchChange}
          category={category}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          sortBy={sortBy}
          sortOrder={order}
          onSortChange={handleSortChange}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Content States */}
        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center shadow-xl my-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-300 font-medium text-sm">Fetching products from API...</p>
            <p className="text-xs text-slate-500 mt-1">Applying filters & pagination rules</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center my-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Failed to Load Products</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">{error}</p>
            </div>
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry API Request
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center shadow-xl my-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <PackageX className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">No Products Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                We couldn&apos;t find any items matching your search query or filter criteria.
              </p>
            </div>
            {(search || category !== 'all' || sortBy !== 'none') && (
              <button
                onClick={() => updateQueryParams({ search: null, category: null, sortBy: null, page: 1 })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg text-sm font-medium transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <ProductTable
              products={products}
              onEdit={(prod) => setEditingProduct(prod)}
              onDelete={(prod) => setDeletingProduct(prod)}
            />

            {/* Mobile Cards */}
            <ProductCardGrid
              products={products}
              onEdit={(prod) => setEditingProduct(prod)}
              onDelete={(prod) => setDeletingProduct(prod)}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalItems={totalProducts}
              pageSize={limit}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </main>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSubmit}
        categories={categories}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={handleEditSubmit}
        initialData={editingProduct}
        categories={categories}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingProduct}
        product={deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        }
      >
        <ProductsDashboardContent />
      </Suspense>
    </ProtectedLayout>
  );
}
