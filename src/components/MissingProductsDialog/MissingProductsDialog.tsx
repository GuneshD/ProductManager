import React, { useState } from 'react';
import { ProductSKU, MissingProductAction } from '../../types';
import { useTranslation } from 'react-i18next';

interface MissingProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  missingProducts: ProductSKU[];
  onConfirm: (action: MissingProductAction) => void;
}

const MissingProductsDialog: React.FC<MissingProductsDialogProps> = ({
  isOpen,
  onClose,
  missingProducts,
  onConfirm
}) => {
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<MissingProductAction>('show');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedAction);
    onClose();
  };

  const getActionDescription = (action: MissingProductAction) => {
    switch (action) {
      case 'show':
        return t('missingProducts.showDescription', 'Keep products visible as they are');
      case 'hide':
        return t('missingProducts.hideDescription', 'Hide products from listings but keep in database');
      case 'delete':
        return t('missingProducts.deleteDescription', 'Permanently delete products from database');
      case 'deactivate':
        return t('missingProducts.deactivateDescription', 'Mark products as inactive');
      default:
        return '';
    }
  };

  const getActionIcon = (action: MissingProductAction) => {
    switch (action) {
      case 'show':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'hide':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
          </svg>
        );
      case 'delete':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'deactivate':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 12m6.364 6.364L12 12m0 0L5.636 5.636M12 12l6.364-6.364M12 12l-6.364 6.364" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('missingProducts.title', 'Missing Products Found')}
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              {t('missingProducts.description', 'The following products exist in your database but are missing from the import file. Please choose what action to take for these products:')}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {missingProducts.length} {t('missingProducts.productsFound', 'products found')}
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('missingProducts.warning', 'These products are currently active in your database but not included in the new import file.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('missingProducts.chooseAction', 'Choose Action')}
            </h3>
            <div className="space-y-3">
              {(['show', 'hide', 'delete', 'deactivate'] as MissingProductAction[]).map((action) => (
                <label
                  key={action}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAction === action
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="missingProductAction"
                    value={action}
                    checked={selectedAction === action}
                    onChange={(e) => setSelectedAction(e.target.value as MissingProductAction)}
                    className="sr-only"
                  />
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedAction === action
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAction === action && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center flex-1">
                    <div className={`mr-3 ${
                      selectedAction === action ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {getActionIcon(action)}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        selectedAction === action ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {t(`missingProducts.${action}`, action.charAt(0).toUpperCase() + action.slice(1))}
                      </div>
                      <div className={`text-sm ${
                        selectedAction === action ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {getActionDescription(action)}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('missingProducts.affectedProducts', 'Affected Products')}
            </h3>
            <div className="bg-gray-50 rounded-lg max-h-64 overflow-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.businessProductId', 'Business Product ID')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.productName', 'Product Name')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.productGroup', 'Product Group')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.productMrp', 'MRP')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {missingProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {product.business_product_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.product_group}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.currency} {product.product_mrp?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {t('missingProducts.selectedAction', 'Selected action')}: 
            <span className="font-medium ml-1">
              {t(`missingProducts.${selectedAction}`, selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1))}
            </span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.confirm', 'Confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissingProductsDialog;