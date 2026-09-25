import axiosInstance from '@/lib/axios';
import { Product, ProductsResponse, User, ProductFormData } from '@/types';

export const authApi = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await axiosInstance.post<User>('/auth/login', {
      username,
      password,
      expiresInMins: 60, // 1 hour token
    });
    return response.data;
  },
};

export const productsApi = {
  // Get products with pagination, search, category filter, and sorting
  getProducts: async (params: {
    limit: number;
    skip: number;
    search?: string;
    category?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    signal?: AbortSignal;
  }): Promise<ProductsResponse> => {
    const { limit, skip, search, category, sortBy, order, signal } = params;

    let url = '/products';

    // DummyJSON API specific routing:
    // If search is present, use /products/search?q=
    // Else if category is present, use /products/category/{category}
    if (search && search.trim() !== '') {
      url = `/products/search`;
    } else if (category && category !== 'all') {
      url = `/products/category/${encodeURIComponent(category)}`;
    }

    const queryParams: Record<string, string | number> = {
      limit,
      skip,
    };

    if (search && search.trim() !== '') {
      queryParams.q = search.trim();
    }

    if (sortBy && sortBy !== 'none') {
      queryParams.sortBy = sortBy;
      queryParams.order = order || 'asc';
    }

    const response = await axiosInstance.get<ProductsResponse>(url, {
      params: queryParams,
      signal,
    });

    return response.data;
  },

  // Get single product details
  getProductById: async (id: number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Get categories list
  getCategories: async (): Promise<Array<{ slug: string; name: string }>> => {
    const response = await axiosInstance.get('/products/categories');
    // DummyJSON returns array of category objects or string array depending on endpoint version
    if (Array.isArray(response.data)) {
      return response.data.map((cat: any) => {
        if (typeof cat === 'string') {
          return { slug: cat, name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ') };
        }
        return { slug: cat.slug || cat.name, name: cat.name || cat.slug };
      });
    }
    return [];
  },

  // Add product
  addProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await axiosInstance.post<Product>('/products/add', {
      ...data,
      images: [data.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      thumbnail: data.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    });
    return response.data;
  },

  // Update product
  updateProduct: async (id: number, data: Partial<ProductFormData>): Promise<Product> => {
    const response = await axiosInstance.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: number): Promise<{ id: number; isDeleted: boolean }> => {
    const response = await axiosInstance.delete<{ id: number; isDeleted: boolean }>(`/products/${id}`);
    return response.data;
  },
};
