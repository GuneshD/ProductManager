import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductSKU, Category, ProductGroup, ProductFilters, SortConfig, OfflineAction } from '../types';
import { useTenant } from './TenantContext';
import { toast, showWarning } from '../utils/notifications';
import localForage from 'localforage';

interface ProductContextType {
  products: ProductSKU[];
  categories: Category[];
  groups: ProductGroup[];
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  sortConfig: SortConfig | null;
  isOffline: boolean;
  offlineActions: OfflineAction[];
  
  // Actions
  fetchProducts: () => Promise<void>;
  addProduct: (product: Partial<ProductSKU>) => Promise<void>;
  updateProduct: (id: string, product: Partial<ProductSKU>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  setSortConfig: (config: SortConfig | null) => void;
  syncOfflineActions: () => Promise<void>;
  clearError: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const { getTenantId, currentUser } = useTenant();
  const [products, setProducts] = useState<ProductSKU[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);

  // Configure localForage for offline storage
  useEffect(() => {
    localForage.config({
      name: 'ProductManagerPWA',
      storeName: 'products',
      description: 'Offline storage for product data'
    });
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Connection restored. Syncing data...');
      syncOfflineActions();
    };

    const handleOffline = () => {
      setIsOffline(true);
      showWarning('You are offline. Changes will be synced when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline actions on mount
  useEffect(() => {
    loadOfflineActions();
  }, []);

  const loadOfflineActions = async () => {
    try {
      const actions = await localForage.getItem<OfflineAction[]>('offlineActions') || [];
      setOfflineActions(actions);
    } catch (error) {
      console.error('Error loading offline actions:', error);
    }
  };

  const saveOfflineAction = async (action: OfflineAction) => {
    try {
      const updatedActions = [...offlineActions, action];
      setOfflineActions(updatedActions);
      await localForage.setItem('offlineActions', updatedActions);
    } catch (error) {
      console.error('Error saving offline action:', error);
    }
  };

  const clearOfflineActions = async () => {
    try {
      setOfflineActions([]);
      await localForage.removeItem('offlineActions');
    } catch (error) {
      console.error('Error clearing offline actions:', error);
    }
  };

  // Mock data for development
  const generateMockData = () => {
    const tenantId = getTenantId() || 'tenant-1';
    const userId = currentUser?.id || 'user-1';
    const now = new Date();

    const mockCategories: Category[] = [
      {
        id: 'cat-1',
        catg_name: 'Electronics',
        catg_status: 'active',
        tenant_id: tenantId,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now
      },
      {
        id: 'cat-2',
        catg_name: 'Clothing',
        catg_status: 'active',
        tenant_id: tenantId,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now
      }
    ];

    const mockGroups: ProductGroup[] = [
      {
        id: 'group-1',
        product_group_name: 'Smartphones',
        category_id: 'cat-1',
        tenant_id: tenantId,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now
      },
      {
        id: 'group-2',
        product_group_name: 'T-Shirts',
        category_id: 'cat-2',
        tenant_id: tenantId,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now
      }
    ];

    const mockProducts: ProductSKU[] = [
      {
        id: 'sku-1',
        product_sku_name: 'iPhone 15 Pro',
        product_sku_id: 'IPH15PRO',
        uom: 'units',
        uom_value: 1,
        is_box: 'yes',
        in_box_units: 1,
        is_combo: 'no',
        sku_status: 'active',
        product_group_id: 'group-1',
        tenant_id: tenantId,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now
      },
      {
        id: 'sku-2',
        product_sku_name: 'Cotton T-Shirt',
        product_sku_id: 'CTSHIRT001',
        uom: 'units',
        uom_value: 1,
        is_box: 'no',
        is_combo: 'no',
        sku_status: 'active',
        product_group_id: 'group-2',
        tenant_id: tenantId,
        created_by: userId,
        created_on: now,
        modified_by: userId,
        modified_on: now
      }
    ];

    return { mockCategories, mockGroups, mockProducts };
  };

  const fetchProducts = async () => {
    console.log('fetchProducts called');
    setLoading(true);
    setError(null);
    
    try {
      const tenantId = getTenantId();
      console.log('Tenant ID:', tenantId);
      if (!tenantId) {
        throw new Error('No tenant ID available');
      }

      if (isOffline) {
        // Load from offline storage
        const cachedProducts = await localForage.getItem<ProductSKU[]>('products') || [];
        const cachedCategories = await localForage.getItem<Category[]>('categories') || [];
        const cachedGroups = await localForage.getItem<ProductGroup[]>('groups') || [];
        
        if (cachedProducts.length === 0) {
          // If no cached data, use mock data
          const { mockCategories, mockGroups, mockProducts } = generateMockData();
          setCategories(mockCategories);
          setGroups(mockGroups);
          setProducts(mockProducts);
        } else {
          setProducts(cachedProducts);
          setCategories(cachedCategories);
          setGroups(cachedGroups);
        }
      } else {
        // In a real app, this would be an API call
        // For now, use mock data and cache it
        const { mockCategories, mockGroups, mockProducts } = generateMockData();
        console.log('Generated mock products:', mockProducts);
        
        setCategories(mockCategories);
        setGroups(mockGroups);
        setProducts(mockProducts);
        console.log('Products state updated with:', mockProducts.length, 'products');
        
        // Cache the data for offline use
        await localForage.setItem('products', mockProducts);
        await localForage.setItem('categories', mockCategories);
        await localForage.setItem('groups', mockGroups);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Partial<ProductSKU>) => {
    try {
      const tenantId = getTenantId();
      const userId = currentUser?.id;
      
      if (!tenantId || !userId) {
        throw new Error('Missing tenant or user information');
      }

      const newProduct: ProductSKU = {
        id: `sku-${Date.now()}`,
        product_sku_name: productData.product_sku_name || '',
        product_sku_id: productData.product_sku_id || '',
        uom: productData.uom || 'units',
        uom_value: productData.uom_value || 1,
        is_box: productData.is_box || 'no',
        in_box_units: productData.in_box_units,
        is_combo: productData.is_combo || 'no',
        parent_product_sku_id: productData.parent_product_sku_id,
        sku_status: productData.sku_status || 'active',
        product_sku_image: productData.product_sku_image,
        product_group_id: productData.product_group_id || '',
        tenant_id: tenantId,
        created_by: userId,
        created_on: new Date(),
        modified_by: userId,
        modified_on: new Date()
      };

      if (isOffline) {
        // Save offline action
        const action: OfflineAction = {
          id: `action-${Date.now()}`,
          type: 'CREATE',
          entity: 'sku',
          data: newProduct,
          timestamp: new Date(),
          tenant_id: tenantId
        };
        await saveOfflineAction(action);
      }

      // Update local state
      setProducts(prev => [...prev, newProduct]);
      
      // Update cache
      const updatedProducts = [...products, newProduct];
      await localForage.setItem('products', updatedProducts);
      
      toast.success('Product added successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const updateProduct = async (id: string, productData: Partial<ProductSKU>) => {
    try {
      const tenantId = getTenantId();
      const userId = currentUser?.id;
      
      if (!tenantId || !userId) {
        throw new Error('Missing tenant or user information');
      }

      if (isOffline) {
        // Save offline action
        const action: OfflineAction = {
          id: `action-${Date.now()}`,
          type: 'UPDATE',
          entity: 'sku',
          data: { id, ...productData, modified_by: userId, modified_on: new Date() },
          timestamp: new Date(),
          tenant_id: tenantId
        };
        await saveOfflineAction(action);
      }

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === id 
          ? { ...product, ...productData, modified_by: userId, modified_on: new Date() }
          : product
      ));
      
      // Update cache
      const updatedProducts = products.map(product => 
        product.id === id 
          ? { ...product, ...productData, modified_by: userId, modified_on: new Date() }
          : product
      );
      await localForage.setItem('products', updatedProducts);
      
      toast.success('Product updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const tenantId = getTenantId();
      
      if (!tenantId) {
        throw new Error('Missing tenant information');
      }

      if (isOffline) {
        // Save offline action
        const action: OfflineAction = {
          id: `action-${Date.now()}`,
          type: 'DELETE',
          entity: 'sku',
          data: { id },
          timestamp: new Date(),
          tenant_id: tenantId
        };
        await saveOfflineAction(action);
      }

      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id));
      
      // Update cache
      const updatedProducts = products.filter(product => product.id !== id);
      await localForage.setItem('products', updatedProducts);
      
      toast.success('Product deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const syncOfflineActions = async () => {
    if (offlineActions.length === 0) return;
    
    try {
      // In a real app, you would send these actions to the backend
      console.log('Syncing offline actions:', offlineActions);
      
      // Clear offline actions after successful sync
      await clearOfflineActions();
      
      toast.success('Offline changes synced successfully');
    } catch (err) {
      console.error('Error syncing offline actions:', err);
      toast.error('Failed to sync offline changes');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Load products on mount, but only after tenant is available
  useEffect(() => {
    const tenantId = getTenantId();
    console.log('useEffect triggered, tenantId:', tenantId);
    if (tenantId) {
      console.log('Calling fetchProducts...');
      fetchProducts();
    } else {
      console.log('No tenant ID available, skipping fetchProducts');
    }
  }, [getTenantId]);

  const value: ProductContextType = {
    products,
    categories,
    groups,
    loading,
    error,
    filters,
    sortConfig,
    isOffline,
    offlineActions,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    setSortConfig,
    syncOfflineActions,
    clearError
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};