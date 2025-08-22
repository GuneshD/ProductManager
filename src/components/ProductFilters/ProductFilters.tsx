import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProductFilters as FilterType, EntityStatus, UOMType, YesNo } from '../../types';
import { Search, Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { t } = useTranslation();

  const handleFilterChange = (key: keyof FilterType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-neutral-500" />
          <h3 className="text-lg font-medium text-neutral-900">
            {t('common.filters')}
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-1 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Search */}
        <div className="col-span-full md:col-span-2">
          <label className="block text-sm font-medium text-formGray mb-2">
            {t('common.search')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
              placeholder="Search products, SKU ID, or group..."
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            {t('products.status')}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value as EntityStatus || undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* UOM Filter */}
        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            {t('products.uom')}
          </label>
          <select
            value={filters.uom || ''}
            onChange={(e) => handleFilterChange('uom', e.target.value as UOMType || undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
          >
            <option value="">All UOMs</option>
            <option value="units">Units</option>
            <option value="Kg">Kilogram (Kg)</option>
            <option value="mg">Milligram (mg)</option>
            <option value="Lit">Liter (Lit)</option>
            <option value="ml">Milliliter (ml)</option>
          </select>
        </div>

        {/* Product Group Filter */}
        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            {t('products.productGroup')}
          </label>
          <select
            value={filters.productGroupId || ''}
            onChange={(e) => handleFilterChange('productGroupId', e.target.value || undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
          >
            <option value="">All Groups</option>
            <option value="group-1">Electronics</option>
            <option value="group-2">Clothing</option>
            <option value="group-3">Food & Beverages</option>
            <option value="group-4">Home & Garden</option>
          </select>
        </div>

        {/* Is Box Filter */}
        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            {t('products.isBox')}
          </label>
          <select
            value={filters.isBox || ''}
            onChange={(e) => handleFilterChange('isBox', e.target.value as YesNo || undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
          >
            <option value="">All</option>
            <option value="yes">Box Products</option>
            <option value="no">Non-Box Products</option>
          </select>
        </div>

        {/* Is Combo Filter */}
        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            {t('products.isCombo')}
          </label>
          <select
            value={filters.isCombo || ''}
            onChange={(e) => handleFilterChange('isCombo', e.target.value as YesNo || undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
          >
            <option value="">All</option>
            <option value="yes">Combo Products</option>
            <option value="no">Non-Combo Products</option>
          </select>
        </div>

        {/* UOM Value Range */}
        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            Min UOM Value
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={filters.minUomValue || ''}
            onChange={(e) => handleFilterChange('minUomValue', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-formGray mb-2">
            Max UOM Value
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={filters.maxUomValue || ''}
            onChange={(e) => handleFilterChange('maxUomValue', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
            placeholder="999.99"
          />
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="border-t border-neutral-200 pt-4">
        <h4 className="text-sm font-medium text-formGray mb-3">Date Range</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-formGray mb-2">
              Created From
            </label>
            <input
              type="date"
              value={filters.createdFrom || ''}
              onChange={(e) => handleFilterChange('createdFrom', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-formGray mb-2">
              Created To
            </label>
            <input
              type="date"
              value={filters.createdTo || ''}
              onChange={(e) => handleFilterChange('createdTo', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-neutral-200 pt-4">
          <h4 className="text-sm font-medium text-formGray mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-skyBlue/10 text-skyBlue">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="ml-1 text-skyBlue hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-earthGreen/10 text-earthGreen">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', undefined)}
                  className="ml-1 text-earthGreen hover:text-green-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.uom && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-deepBrown/10 text-deepBrown">
                UOM: {filters.uom}
                <button
                  onClick={() => handleFilterChange('uom', undefined)}
                  className="ml-1 text-deepBrown hover:text-amber-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.productGroupId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-goldenYellow/10 text-goldenYellow">
                Group: {filters.productGroupId === 'group-1' ? 'Electronics' : 
                        filters.productGroupId === 'group-2' ? 'Clothing' :
                        filters.productGroupId === 'group-3' ? 'Food & Beverages' : 'Home & Garden'}
                <button
                  onClick={() => handleFilterChange('productGroupId', undefined)}
                  className="ml-1 text-goldenYellow hover:text-yellow-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.isBox && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                Box: {filters.isBox}
                <button
                  onClick={() => handleFilterChange('isBox', undefined)}
                  className="ml-1 text-neutral-600 hover:text-neutral-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.isCombo && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                Combo: {filters.isCombo}
                <button
                  onClick={() => handleFilterChange('isCombo', undefined)}
                  className="ml-1 text-neutral-600 hover:text-neutral-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.minUomValue || filters.maxUomValue) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                UOM Range: {filters.minUomValue || '0'} - {filters.maxUomValue || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('minUomValue', undefined);
                    handleFilterChange('maxUomValue', undefined);
                  }}
                  className="ml-1 text-neutral-600 hover:text-neutral-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.createdFrom || filters.createdTo) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Date: {filters.createdFrom || '...'} to {filters.createdTo || '...'}
                <button
                  onClick={() => {
                    handleFilterChange('createdFrom', undefined);
                    handleFilterChange('createdTo', undefined);
                  }}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;