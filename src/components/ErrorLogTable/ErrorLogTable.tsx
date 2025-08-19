import React, { useState } from 'react';
import { ValidatedProduct } from '../../types';
import { downloadValidationResults } from '../../utils/productValidation';
import { useTranslation } from 'react-i18next';

interface ErrorLogTableProps {
  isOpen: boolean;
  onClose: () => void;
  validatedProducts: ValidatedProduct[];
}

const ErrorLogTable: React.FC<ErrorLogTableProps> = ({
  isOpen,
  onClose,
  validatedProducts
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'accepted' | 'error' | 'warning'>('all');

  if (!isOpen) return null;

  const filteredProducts = validatedProducts.filter(product => {
    if (filter === 'all') return true;
    return product.validation.status === filter;
  });

  const getRowColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 hover:bg-green-100';
      case 'error':
        return 'bg-red-50 hover:bg-red-100';
      case 'warning':
        return 'bg-yellow-50 hover:bg-yellow-100';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getActionBadge = (action: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (action) {
      case 'insert':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'update':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'skip':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleExport = () => {
    const productsToExport = filter === 'all' ? validatedProducts : filteredProducts;
    downloadValidationResults(productsToExport, `validation-log-${filter}.csv`);
  };

  const getFilterCount = (filterType: 'all' | 'accepted' | 'error' | 'warning') => {
    if (filterType === 'all') return validatedProducts.length;
    return validatedProducts.filter(p => p.validation.status === filterType).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('errorLog.title', 'Validation Error Log')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters and Export */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex space-x-2">
            {(['all', 'accepted', 'error', 'warning'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === filterType
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t(`errorLog.filter.${filterType}`, filterType.charAt(0).toUpperCase() + filterType.slice(1))}
                <span className="ml-1 text-xs">
                  ({getFilterCount(filterType)})
                </span>
              </button>
            ))}
          </div>
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('errorLog.export', 'Export Filtered Results')}
          </button>
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span className="text-gray-700">{t('errorLog.legend.accepted', 'Accepted Records')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
              <span className="text-gray-700">{t('errorLog.legend.rejected', 'Rejected Records')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
              <span className="text-gray-700">{t('errorLog.legend.warning', 'Warning Records')}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">
                  {t('errorLog.noRecords', 'No records match the selected filter')}
                </p>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('errorLog.row', 'Row')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('errorLog.status', 'Status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('errorLog.action', 'Action')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.businessProductId', 'Business Product ID')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.pricelistId', 'Pricelist ID')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.productName', 'Product Name')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.productMrp', 'MRP')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('products.currency', 'Currency')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('errorLog.remark', 'Remark')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={`${product.rowIndex}-${product.business_product_id}`}
                    className={getRowColor(product.validation.status)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.rowIndex + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={getStatusBadge(product.validation.status)}>
                        {product.validation.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={getActionBadge(product.validation.action)}>
                        {product.validation.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.business_product_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {product.pricelist_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {product.product_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {product.currency} {product.product_mrp?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {product.currency}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={product.validation.remark}>
                        {product.validation.remark}
                      </div>
                      {product.validation.errors.length > 0 && (
                        <div className="mt-1">
                          {product.validation.errors.map((error, index) => (
                            <div key={index} className="text-xs text-red-600">
                              • {error}
                            </div>
                          ))}
                        </div>
                      )}
                      {product.validation.warnings.length > 0 && (
                        <div className="mt-1">
                          {product.validation.warnings.map((warning, index) => (
                            <div key={index} className="text-xs text-yellow-600">
                              ⚠ {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {t('errorLog.showing', 'Showing')} {filteredProducts.length} {t('errorLog.of', 'of')} {validatedProducts.length} {t('errorLog.records', 'records')}
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogTable;