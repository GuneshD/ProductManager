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
        business_id: tenantId,
        pricelist_id: 'PL001',
        pricelist_upload_date: '2024-01-15',
        pricelist_name: 'Electronics Pricelist Q1 2024',
        product_group: 'Smartphones',
        product_catg: 'Electronics',
        product_name: 'iPhone 15 Pro',
        product_description: 'Latest iPhone with advanced camera system and titanium design',
        product_uom: 'units',
        product_uom_value: 1,
        business_product_id: 'IPH15PRO',
        box_units: 1,
        parent_product_id: null,
        product_status: 'active',
        currency: 'INR',
        product_mrp: 134900,
        sgst: 9,
        cgst: 9,
        igst: 18,
        dealer_price: 125000,
        product_updated_by: 'admin@company.com',
        product_verified_by: 'manager@company.com',
        product_remark: 'Premium smartphone with high demand'
      },
      {
        id: 'sku-2',
        business_id: tenantId,
        pricelist_id: 'PL002',
        pricelist_upload_date: '2024-01-20',
        pricelist_name: 'Clothing Pricelist Q1 2024',
        product_group: 'T-Shirts',
        product_catg: 'Clothing',
        product_name: 'Cotton T-Shirt',
        product_description: '100% cotton comfortable t-shirt available in multiple colors',
        product_uom: 'pieces',
        product_uom_value: 1,
        business_product_id: 'CTSHIRT001',
        box_units: 12,
        parent_product_id: null,
        product_status: 'active',
        currency: 'INR',
        product_mrp: 899,
        sgst: 2.5,
        cgst: 2.5,
        igst: 5,
        dealer_price: 750,
        product_updated_by: 'inventory@company.com',
        product_verified_by: 'supervisor@company.com',
        product_remark: 'Popular casual wear item'
      },
      {
        id: 'sku-3',
        business_id: tenantId,
        pricelist_id: 'PL001',
        pricelist_upload_date: '2024-01-15',
        pricelist_name: 'Electronics Pricelist Q1 2024',
        product_group: 'Smartphones',
        product_catg: 'Electronics',
        product_name: 'Samsung Galaxy S24',
        product_description: 'Android smartphone with AI-powered camera and long battery life',
        product_uom: 'units',
        product_uom_value: 1,
        business_product_id: 'SGS24',
        box_units: 1,
        parent_product_id: null,
        product_status: 'active',
        currency: 'INR',
        product_mrp: 79999,
        sgst: 9,
        cgst: 9,
        igst: 18,
        dealer_price: 74000,
        product_updated_by: 'admin@company.com',
        product_verified_by: 'manager@company.com',
        product_remark: 'Competitive Android flagship'
      },
      {
        id: 'sku-4',
        business_id: tenantId,
        pricelist_id: 'PL003',
        pricelist_upload_date: '2024-01-25',
        pricelist_name: 'Accessories Pricelist Q1 2024',
        product_group: 'Phone Accessories',
        product_catg: 'Electronics',
        product_name: 'Wireless Charger',
        product_description: 'Fast wireless charging pad compatible with all Qi-enabled devices',
        product_uom: 'units',
        product_uom_value: 1,
        business_product_id: 'WC001',
        box_units: 6,
        parent_product_id: null,
        product_status: 'inactive',
        currency: 'INR',
        product_mrp: 2999,
        sgst: 9,
        cgst: 9,
        igst: 18,
        dealer_price: 2500,
        product_updated_by: 'inventory@company.com',
        product_verified_by: 'supervisor@company.com',
        product_remark: 'Currently out of stock'
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
        business_id: tenantId,
        pricelist_id: productData.pricelist_id || 'PL001',
        pricelist_upload_date: productData.pricelist_upload_date || new Date().toISOString().split('T')[0],
        pricelist_name: productData.pricelist_name || 'Default Pricelist',
        product_group: productData.product_group || '',
        product_catg: productData.product_catg || '',
        product_name: productData.product_name || '',
        product_description: productData.product_description || '',
        product_uom: productData.product_uom || 'units',
        product_uom_value: productData.product_uom_value || 1,
        business_product_id: productData.business_product_id || '',
        box_units: productData.box_units || 1,
        parent_product_id: productData.parent_product_id || null,
        product_status: productData.product_status || 'active',
        currency: productData.currency || 'INR',
        product_mrp: productData.product_mrp || 0,
        sgst: productData.sgst || 0,
        cgst: productData.cgst || 0,
        igst: productData.igst || 0,
        dealer_price: productData.dealer_price || 0,
        product_updated_by: productData.product_updated_by || userId,
        product_verified_by: productData.product_verified_by || userId,
        product_remark: productData.product_remark || ''
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