'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductFormData } from '@/types';
import { productsApi } from '@/services/api';

interface ProductContextType {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedIds: number[];
  handleAddProduct: (formData: ProductFormData) => Promise<Product>;
  handleUpdateProduct: (id: number, formData: Partial<ProductFormData>) => Promise<Product>;
  handleDeleteProduct: (id: number) => Promise<void>;
  applyLocalOverlayToList: (fetchedProducts: Product[]) => Product[];
  applyLocalOverlayToItem: (fetchedProduct: Product) => Product | null;
  resetLocalState: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ADDED: 'local_added_products',
  UPDATED: 'local_updated_products',
  DELETED: 'local_deleted_ids',
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  // Load local overlays from localStorage on client mount
  useEffect(() => {
    try {
      const storedAdded = localStorage.getItem(STORAGE_KEYS.ADDED);
      const storedUpdated = localStorage.getItem(STORAGE_KEYS.UPDATED);
      const storedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED);

      if (storedAdded) setAddedProducts(JSON.parse(storedAdded));
      if (storedUpdated) setUpdatedProducts(JSON.parse(storedUpdated));
      if (storedDeleted) setDeletedIds(JSON.parse(storedDeleted));
    } catch (e) {
      console.error('Failed to load local product overlays from storage', e);
    }
  }, []);

  // Save changes to localStorage helper
  const saveToStorage = (added: Product[], updated: Record<number, Partial<Product>>, deleted: number[]) => {
    localStorage.setItem(STORAGE_KEYS.ADDED, JSON.stringify(added));
    localStorage.setItem(STORAGE_KEYS.UPDATED, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.DELETED, JSON.stringify(deleted));
  };

  const handleAddProduct = async (formData: ProductFormData): Promise<Product> => {
    // 1. Send API request using Axios
    const apiResult = await productsApi.addProduct(formData);
    
    // Create product object (assign local unique ID if DummyJSON returns duplicate standard ID like 195)
    const newProduct: Product = {
      ...apiResult,
      id: Date.now(), // Generate unique numeric ID for local overlay persistence
      title: formData.title,
      price: Number(formData.price),
      category: formData.category,
      rating: Number(formData.rating || 4.5),
      stock: Number(formData.stock),
      description: formData.description,
      brand: formData.brand || 'Generic',
      images: [formData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      thumbnail: formData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    };

    const newAdded = [newProduct, ...addedProducts];
    setAddedProducts(newAdded);
    saveToStorage(newAdded, updatedProducts, deletedIds);
    return newProduct;
  };

  const handleUpdateProduct = async (id: number, formData: Partial<ProductFormData>): Promise<Product> => {
    // 1. Send API request using Axios (if numeric id is valid on server)
    try {
      if (id < 1000) {
        await productsApi.updateProduct(id, formData);
      }
    } catch (e) {
      console.warn('API update endpoint returned notice (mocked endpoint):', e);
    }

    // Check if product is locally added
    const isLocallyAdded = addedProducts.some(p => p.id === id);

    if (isLocallyAdded) {
      const newAdded = addedProducts.map(p => p.id === id ? { ...p, ...formData } : p);
      setAddedProducts(newAdded);
      saveToStorage(newAdded, updatedProducts, deletedIds);
      return newAdded.find(p => p.id === id)!;
    } else {
      const newUpdated = {
        ...updatedProducts,
        [id]: { ...(updatedProducts[id] || {}), ...formData },
      };
      setUpdatedProducts(newUpdated);
      saveToStorage(addedProducts, newUpdated, deletedIds);
      return { id, ...formData } as Product;
    }
  };

  const handleDeleteProduct = async (id: number): Promise<void> => {
    // Send API delete request using Axios
    try {
      if (id < 1000) {
        await productsApi.deleteProduct(id);
      }
    } catch (e) {
      console.warn('API delete endpoint returned notice (mocked endpoint):', e);
    }

    const isLocallyAdded = addedProducts.some(p => p.id === id);
    if (isLocallyAdded) {
      const newAdded = addedProducts.filter(p => p.id !== id);
      setAddedProducts(newAdded);
      saveToStorage(newAdded, updatedProducts, deletedIds);
    } else {
      const newDeleted = [...deletedIds, id];
      setDeletedIds(newDeleted);
      saveToStorage(addedProducts, updatedProducts, newDeleted);
    }
  };

  // Merge local overlay with API fetched products list
  const applyLocalOverlayToList = (fetchedProducts: Product[]): Product[] => {
    // 1. Filter out deleted products
    let list = fetchedProducts.filter(p => !deletedIds.includes(p.id));

    // 2. Apply updates
    list = list.map(p => {
      if (updatedProducts[p.id]) {
        return { ...p, ...updatedProducts[p.id] };
      }
      return p;
    });

    return list;
  };

  // Merge local overlay for single product details page
  const applyLocalOverlayToItem = (fetchedProduct: Product): Product | null => {
    if (deletedIds.includes(fetchedProduct.id)) return null;
    if (updatedProducts[fetchedProduct.id]) {
      return { ...fetchedProduct, ...updatedProducts[fetchedProduct.id] };
    }
    return fetchedProduct;
  };

  const resetLocalState = () => {
    setAddedProducts([]);
    setUpdatedProducts({});
    setDeletedIds([]);
    localStorage.removeItem(STORAGE_KEYS.ADDED);
    localStorage.removeItem(STORAGE_KEYS.UPDATED);
    localStorage.removeItem(STORAGE_KEYS.DELETED);
  };

  return (
    <ProductContext.Provider
      value={{
        addedProducts,
        updatedProducts,
        deletedIds,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        applyLocalOverlayToList,
        applyLocalOverlayToItem,
        resetLocalState,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
