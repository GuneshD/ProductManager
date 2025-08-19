import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../contexts/ProductContext';
// import { useTenant } from '../contexts/TenantContext'; // Will be used for tenant-specific operations
import { ProductSKU, ProductFormData, ProductFilters, SortConfig, TableColumn, EntityStatus } from '../types';
import { Plus, Download, RefreshCw, Filter, Columns } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductTable from '../components/ProductTable/ProductTable';
import ProductForm from '../components/ProductForm/ProductForm';
import Pagination from '../components/Pagination/Pagination';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProducts();
  // const { getTenantId } = useTenant(); // Will be used for tenant-specific operations

  const [filters, setFilters] = useState<ProductFilters>({
    search: undefined,
    product_status: undefined,
    product_uom: undefined,
    product_group: undefined,
    product_catg: undefined,
    pricelist_id: undefined,
    currency: undefined
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'created_at',
    direction: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductSKU | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  // Table columns configuration
  const allColumns: TableColumn[] = [
    { id: 'pricelist_id', header: t('products.pricelistId'), label: t('products.pricelistId'), key: 'pricelist_id', accessorKey: 'pricelist_id', type: 'text' },
    { id: 'pricelist_upload_date', header: t('products.pricelistUploadDate'), label: t('products.pricelistUploadDate'), key: 'pricelist_upload_date', accessorKey: 'pricelist_upload_date', type: 'text' },
    { id: 'pricelist_name', header: t('products.pricelistName'), label: t('products.pricelistName'), key: 'pricelist_name', accessorKey: 'pricelist_name', type: 'text' },
    { id: 'product_group', header: t('products.productGroup'), label: t('products.productGroup'), key: 'product_group', accessorKey: 'product_group', type: 'text' },
    { id: 'product_catg', header: t('products.productCategory'), label: t('products.productCategory'), key: 'product_catg', accessorKey: 'product_catg', type: 'text' },
    { id: 'product_name', header: t('products.productName'), label: t('products.productName'), key: 'product_name', accessorKey: 'product_name', type: 'text' },
    { id: 'product_description', header: t('products.productDescription'), label: t('products.productDescription'), key: 'product_description', accessorKey: 'product_description', type: 'text' },
    { id: 'product_uom', header: t('products.productUom'), label: t('products.productUom'), key: 'product_uom', accessorKey: 'product_uom', type: 'text' },
    { id: 'product_uom_value', header: t('products.productUomValue'), label: t('products.productUomValue'), key: 'product_uom_value', accessorKey: 'product_uom_value', type: 'number' },
    { id: 'business_product_id', header: t('products.businessProductId'), label: t('products.businessProductId'), key: 'business_product_id', accessorKey: 'business_product_id', type: 'text' },
    { id: 'box_units', header: t('products.boxUnits'), label: t('products.boxUnits'), key: 'box_units', accessorKey: 'box_units', type: 'number' },
    { id: 'parent_product_id', header: t('products.parentProductId'), label: t('products.parentProductId'), key: 'parent_product_id', accessorKey: 'parent_product_id', type: 'text' },
    { id: 'product_status', header: t('products.productStatus'), label: t('products.productStatus'), key: 'product_status', accessorKey: 'product_status', type: 'select' },
    { id: 'currency', header: t('products.currency'), label: t('products.currency'), key: 'currency', accessorKey: 'currency', type: 'text' },
    { id: 'product_mrp', header: t('products.productMrp'), label: t('products.productMrp'), key: 'product_mrp', accessorKey: 'product_mrp', type: 'number' },
    { id: 'sgst', header: t('products.sgst'), label: t('products.sgst'), key: 'sgst', accessorKey: 'sgst', type: 'number' },
    { id: 'cgst', header: t('products.cgst'), label: t('products.cgst'), key: 'cgst', accessorKey: 'cgst', type: 'number' },
    { id: 'igst', header: t('products.igst'), label: t('products.igst'), key: 'igst', accessorKey: 'igst', type: 'number' },
    { id: 'dealer_price', header: t('products.dealerPrice'), label: t('products.dealerPrice'), key: 'dealer_price', accessorKey: 'dealer_price', type: 'number' },
    { id: 'product_updated_by', header: t('products.productUpdatedBy'), label: t('products.productUpdatedBy'), key: 'product_updated_by', accessorKey: 'product_updated_by', type: 'text' },
    { id: 'product_verified_by', header: t('products.productVerifiedBy'), label: t('products.productVerifiedBy'), key: 'product_verified_by', accessorKey: 'product_verified_by', type: 'text' },
    { id: 'product_remark', header: t('products.productRemark'), label: t('products.productRemark'), key: 'product_remark', accessorKey: 'product_remark', type: 'text' }
  ];

  // Initialize visible columns on first render
  useEffect(() => {
    if (Object.keys(visibleColumns).length === 0) {
      const initialVisibility = allColumns.reduce((acc, column) => {
        acc[column.id] = true; // All columns visible by default
        return acc;
      }, {} as Record<string, boolean>);
      setVisibleColumns(initialVisibility);
    }
  }, [allColumns, visibleColumns]);

  // Filter columns based on visibility
  const visibleColumnsArray = allColumns.filter(column => visibleColumns[column.id]);

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!product.product_name.toLowerCase().includes(searchLower) &&
          !product.business_product_id.toLowerCase().includes(searchLower) &&
          !product.product_description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.product_status && product.product_status !== filters.product_status) return false;
    if (filters.product_uom && product.product_uom !== filters.product_uom) return false;
    if (filters.product_group && product.product_group !== filters.product_group) return false;
    if (filters.product_catg && product.product_catg !== filters.product_catg) return false;
    if (filters.pricelist_id && product.pricelist_id !== filters.pricelist_id) return false;
    if (filters.currency && product.currency !== filters.currency) return false;

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSort = (accessorKey: string) => {
    setSortConfig(prev => ({
      key: accessorKey,
      direction: prev.key === accessorKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: ProductSKU) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success(t('products.deleteSuccess'));
    } catch (error) {
      toast.error(t('products.deleteError'));
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<ProductSKU>) => {
    try {
      await updateProduct(productId, updates);
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      // Transform ProductFormData to ProductSKU format
      const productData: Partial<ProductSKU> = {
        product_sku_name: data.sku.name,
        product_sku_id: data.sku.sku_id,
        uom: data.sku.uom,
        uom_value: data.sku.uom_value,
        is_box: data.sku.is_box,
        in_box_units: data.sku.in_box_units,
        is_combo: data.sku.is_combo,
        parent_product_sku_id: data.sku.parent_product_sku_id,
        sku_status: data.sku.status,
        product_sku_image: data.sku.image,
        product_group_id: `group-${Date.now()}`, // Generate a group ID based on group name
        product_group: {
          id: `group-${Date.now()}`,
          product_group_name: data.group.name,
          product_group_image: data.group.image || '',
          tenant_id: '',
          created_by: '',
          created_on: new Date(),
          modified_by: '',
          modified_on: new Date(),
          category: {
            id: `cat-${Date.now()}`,
            catg_name: data.category.name,
            catg_status: data.category.status,
            tenant_id: '',
            created_by: '',
            created_on: new Date(),
            modified_by: '',
            modified_on: new Date()
          }
        }
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success(t('products.updateSuccess'));
      } else {
        await addProduct(productData);
        toast.success(t('products.addSuccess'));
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error(editingProduct ? t('products.updateError') : t('products.addError'));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: undefined,
      category_id: undefined,
      group_id: undefined,
      status: undefined,
      uom: undefined,
      is_box: undefined,
      is_combo: undefined,
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Product Name', 'SKU ID', 'UOM', 'UOM Value', 'Status', 'Group', 'Category',
      'Is Box', 'In Box Units', 'Is Combo', 'Parent SKU ID', 'Product Image',
      'Group Image', 'Tenant ID', 'Created By', 'Created On', 'Modified By', 'Modified On'
    ].join(',');
    
    const rows = sortedProducts.map(product => [
      product.product_sku_name,
      product.product_sku_id,
      product.uom,
      product.uom_value,
      product.sku_status,
      product.product_group?.product_group_name || '',
      product.product_group?.category?.catg_name || '',
      product.is_box,
      product.in_box_units || '',
      product.is_combo,
      product.parent_product_sku_id || '',
      product.product_sku_image || '',
      product.product_group?.product_group_image || '',
      product.tenant_id,
      product.created_by,
      new Date(product.created_on).toISOString(),
      product.modified_by,
      new Date(product.modified_on).toISOString()
    ].map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t('products.exportSuccess'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              showFilters
                ? 'border-skyBlue text-white bg-skyBlue'
                : 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('products.filters')}
          </button>
          
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
          
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('products.export')}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowColumnPanel(!showColumnPanel)}
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                showColumnPanel
                  ? 'border-skyBlue text-white bg-skyBlue'
                  : 'border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50'
              }`}
            >
              <Columns className="h-4 w-4 mr-2" />
              {t('products.columns')}
            </button>
            
            {showColumnPanel && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {t('products.columnVisibility')}
                  </h3>
                  <div className="space-y-2">
                    {allColumns.map((column) => (
                      <label key={column.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={visibleColumns[column.id] || false}
                          onChange={() => toggleColumnVisibility(column.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {column.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={() => {
                        const allVisible = allColumns.reduce((acc, column) => {
                          acc[column.id] = true;
                          return acc;
                        }, {} as Record<string, boolean>);
                        setVisibleColumns(allVisible);
                      }}
                      className="text-xs text-earthGreen hover:text-green-700"
                    >
                      {t('common.selectAll')}
                    </button>
                    <button
                      onClick={() => {
                        const noneVisible = allColumns.reduce((acc, column) => {
                          acc[column.id] = false;
                          return acc;
                        }, {} as Record<string, boolean>);
                        setVisibleColumns(noneVisible);
                      }}
                      className="text-xs text-neutral-600 hover:text-neutral-800"
                    >
                      {t('common.selectNone')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-earthGreen hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('products.addProduct')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-formGray mb-1">
                {t('products.search')}
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-earthGreen"
                placeholder={t('products.searchPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-formGray mb-1">
                {t('products.status')}
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as EntityStatus || undefined }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-earthGreen"
              >
                <option value="">{t('common.all')}</option>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
            
            <div className="md:col-span-3 lg:col-span-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800"
              >
                {t('common.clearFilters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {error ? (
        <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 text-earthGreen hover:text-green-700"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <>
          <ProductTable
            products={paginatedProducts}
            columns={visibleColumnsArray}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onUpdate={handleUpdateProduct}
            sortConfig={sortConfig}
            onSort={handleSort}
            loading={loading}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ProductsPage;