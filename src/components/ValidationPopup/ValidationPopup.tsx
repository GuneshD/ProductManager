import React from 'react';
import { ValidatedProduct, ValidationSummary } from '../../types';
import { downloadValidationResults } from '../../utils/productValidation';
import { useTranslation } from 'react-i18next';

interface ValidationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  validationSummary: ValidationSummary;
  onProceedToSummary: () => void;
}

const ValidationPopup: React.FC<ValidationPopupProps> = ({
  isOpen,
  onClose,
  validationSummary,
  onProceedToSummary
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-800';
      case 'error':
        return 'bg-red-50 text-red-800';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800';
      default:
        return 'bg-gray-50 text-gray-800';
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
    downloadValidationResults(validationSummary.validatedProducts, 'product-validation-results.csv');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('validation.title', 'Product Validation Results')}
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

        {/* Summary Stats */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{validationSummary.totalRows}</div>
              <div className="text-sm text-gray-600">{t('validation.totalRows', 'Total Rows')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{validationSummary.acceptedRows}</div>
              <div className="text-sm text-gray-600">{t('validation.accepted', 'Accepted')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{validationSummary.errorRows}</div>
              <div className="text-sm text-gray-600">{t('validation.errors', 'Errors')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{validationSummary.warningRows}</div>
              <div className="text-sm text-gray-600">{t('validation.warnings', 'Warnings')}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('validation.row', 'Row')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('validation.status', 'Status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('validation.action', 'Action')}
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
                    {t('validation.remark', 'Remark')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validationSummary.validatedProducts.map((product) => (
                  <tr
                    key={`${product.rowIndex}-${product.business_product_id}`}
                    className={getStatusColor(product.validation.status)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {product.rowIndex + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.validation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        product.validation.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.validation.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={getActionBadge(product.validation.action)}>
                        {product.validation.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {product.business_product_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {product.pricelist_id}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.product_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {product.currency} {product.product_mrp?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {product.currency}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.validation.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('validation.export', 'Export Results')}
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={onProceedToSummary}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('validation.proceedToSummary', 'Proceed to Summary')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationPopup;