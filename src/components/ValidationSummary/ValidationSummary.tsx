import React from 'react';
import { ValidationSummary as ValidationSummaryType } from '../../types';
import { canSyncToDatabase } from '../../utils/productValidation';
import { useTranslation } from 'react-i18next';

interface ValidationSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  validationSummary: ValidationSummaryType;
  onShowMissingProducts: () => void;
  onShowErrorLog: () => void;
  onSyncToDatabase: () => void;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  isOpen,
  onClose,
  validationSummary,
  onShowMissingProducts,
  onShowErrorLog,
  onSyncToDatabase
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const canSync = canSyncToDatabase(validationSummary);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('validation.summaryTitle', 'Import Validation Summary')}
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

        {/* Summary Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Updates Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-orange-900">{validationSummary.updateCount}</p>
                  <p className="text-sm text-orange-700">{t('validation.rowsWillBeUpdated', 'rows will be updated')}</p>
                </div>
              </div>
            </div>

            {/* Inserts Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-green-900">{validationSummary.insertCount}</p>
                  <p className="text-sm text-green-700">{t('validation.rowsWillBeAdded', 'rows will be added')}</p>
                </div>
              </div>
            </div>

            {/* Missing Products Card */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-yellow-900">{validationSummary.missingProducts.length}</p>
                  <p className="text-sm text-yellow-700">{t('validation.productsMissing', 'products missing')}</p>
                  {validationSummary.missingProducts.length > 0 && (
                    <button
                      onClick={onShowMissingProducts}
                      className="text-xs text-yellow-800 underline hover:text-yellow-900 mt-1"
                    >
                      {t('validation.showList', 'Show list')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Errors Card */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-red-900">{validationSummary.errorRows}</p>
                  <p className="text-sm text-red-700">{t('validation.errors', 'errors')}</p>
                  {validationSummary.errorRows > 0 && (
                    <button
                      onClick={onShowErrorLog}
                      className="text-xs text-red-800 underline hover:text-red-900 mt-1"
                    >
                      {t('validation.showReasons', 'Show reasons')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('validation.detailedBreakdown', 'Detailed Breakdown')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t('validation.totalRows', 'Total Rows')}:</span>
                <span className="ml-2 font-medium">{validationSummary.totalRows}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('validation.accepted', 'Accepted')}:</span>
                <span className="ml-2 font-medium text-green-600">{validationSummary.acceptedRows}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('validation.warnings', 'Warnings')}:</span>
                <span className="ml-2 font-medium text-yellow-600">{validationSummary.warningRows}</span>
              </div>
              <div>
                <span className="text-gray-600">{t('validation.skipped', 'Skipped')}:</span>
                <span className="ml-2 font-medium text-gray-600">{validationSummary.skipCount}</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {!canSync && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {t('validation.cannotSync', 'Cannot sync to database')}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {t('validation.fixErrors', 'Please fix all errors before proceeding with the import.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {canSync && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {t('validation.readyToSync', 'Ready to sync')}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    {t('validation.allValidationsPassed', 'All validations passed. You can proceed with the database import.')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            {validationSummary.errorRows > 0 && (
              <button
                onClick={onShowErrorLog}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('validation.viewErrorLog', 'View Error Log')}
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            {canSync && (
              <button
                onClick={onSyncToDatabase}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {t('validation.syncToDatabase', 'Sync to Database')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;