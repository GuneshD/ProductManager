import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw,
  Download,
  Columns,
  Plus,
  FileText,
  CheckCircle,
  Upload
} from 'lucide-react';
import { ProductSKU, ValidatedProduct, ValidationSummary, MissingProductAction } from '../types';
import { validateProducts } from '../utils/productValidation';
import { useProducts } from '../contexts/ProductContext';
import ValidationPopup from '../components/ValidationPopup/ValidationPopup';
import { default as ValidationSummaryComponent } from '../components/ValidationSummary/ValidationSummary';
import MissingProductsDialog from '../components/MissingProductsDialog/MissingProductsDialog';
import ErrorLogTable from '../components/ErrorLogTable/ErrorLogTable';
import ConfirmationDialog from '../components/ConfirmationDialog/ConfirmationDialog';
import { toast } from 'react-hot-toast';

interface ImportedFile {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'error';
  recordCount: number;
  validationStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
  updateStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
  lastUpdateDate?: string;
  canRestore: boolean;
  restoreStatus?: 'not_started' | 'in_progress' | 'completed' | 'failed';
  validatedProducts?: ValidatedProduct[];
  validationSummary?: ValidationSummary;
  rawData?: ProductSKU[];
}

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const { products, addProduct, updateProduct } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Validation workflow state
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [showMissingProductsDialog, setShowMissingProductsDialog] = useState(false);
  const [showErrorLogTable, setShowErrorLogTable] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [currentValidationData, setCurrentValidationData] = useState<{
    validatedProducts: ValidatedProduct[];
    summary: ValidationSummary;
    missingProducts: ProductSKU[];
  } | null>(null);
  const [selectedMissingAction, setSelectedMissingAction] = useState<MissingProductAction>('show');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([
    {
      id: '1',
      fileName: 'products_batch_001.xlsx',
      uploadDate: '2024-01-15 10:30:00',
      status: 'verified',
      recordCount: 150,
      validationStatus: 'not_started',
      updateStatus: 'not_started',
      canRestore: false,
      restoreStatus: 'not_started'
    },
    {
      id: '2',
      fileName: 'inventory_update_jan.csv',
      uploadDate: '2024-01-14 15:45:00',
      status: 'verified',
      recordCount: 89,
      validationStatus: 'completed',
      updateStatus: 'completed',
      lastUpdateDate: '2024-01-14 16:00:00',
      canRestore: true,
      restoreStatus: 'not_started'
    },
    {
      id: '3',
      fileName: 'new_products_q1.xlsx',
      uploadDate: '2024-01-13 09:15:00',
      status: 'verified',
      recordCount: 45,
      validationStatus: 'completed',
      updateStatus: 'not_started',
      canRestore: false,
      restoreStatus: 'not_started'
    }
  ]);

  const [selectedColumns, setSelectedColumns] = useState({
    fileName: true,
    uploadDate: true,
    status: true,
    recordCount: true,
    actions: true
  });

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedFileForRestore, setSelectedFileForRestore] = useState<ImportedFile | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  const handleRefresh = () => {
    // Refresh imported files list
    console.log('Refreshing imported files...');
  };

  const handleExport = () => {
    // Export imported files list
    console.log('Exporting imported files list...');
  };

  const handleNewImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error(t('import.invalidFileType', 'Please select a CSV or Excel file'));
      return;
    }

    try {
      setIsProcessing(true);
      
      // Parse file content (simplified - in real app would use proper CSV/Excel parser)
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error(t('import.emptyFile', 'File appears to be empty or invalid'));
        return;
      }

      // Parse CSV headers and data (simplified)
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rawData: ProductSKU[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= headers.length) {
          const product: Partial<ProductSKU> = {};
          headers.forEach((header, index) => {
            const value = values[index];
            switch (header.toLowerCase()) {
              case 'business_product_id':
              case 'productid':
              case 'product_id':
                product.business_product_id = value;
                break;
              case 'pricelist_id':
                product.pricelist_id = value || 'DEFAULT_PRICELIST';
                break;
              case 'product_name':
              case 'name':
                product.product_name = value;
                break;
              case 'product_mrp':
              case 'mrp':
                product.product_mrp = parseFloat(value) || 0;
                break;
              case 'currency':
                product.currency = value;
                break;
              case 'product_group':
                product.product_group = value;
                break;
              case 'product_catg':
              case 'category':
                product.product_catg = value;
                break;
              case 'product_description':
              case 'description':
                product.product_description = value;
                break;
              case 'product_uom':
                product.product_uom = value || 'PCS';
                break;
              case 'product_uom_value':
                product.product_uom_value = parseFloat(value) || 1;
                break;
              case 'box_units':
                product.box_units = parseInt(value) || 1;
                break;
              case 'dealer_price':
                product.dealer_price = parseFloat(value) || 0;
                break;
              case 'sgst':
                product.sgst = parseFloat(value) || 0;
                break;
              case 'cgst':
                product.cgst = parseFloat(value) || 0;
                break;
              case 'igst':
                product.igst = parseFloat(value) || 0;
                break;
            }
          });
          
          if (product.business_product_id && product.product_name) {
            rawData.push(product as ProductSKU);
          }
        }
      }

      if (rawData.length === 0) {
        toast.error(t('import.noValidData', 'No valid product data found in file'));
        return;
      }

      // Create new imported file record
      const newFile: ImportedFile = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date().toLocaleString(),
        status: 'verified',
        recordCount: rawData.length,
        validationStatus: 'not_started',
        updateStatus: 'not_started',
        canRestore: false,
        rawData
      };

      setImportedFiles(prev => [newFile, ...prev]);
      toast.success(t('import.uploadSuccess', 'File uploaded successfully'));
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(t('import.uploadError', 'Error processing file'));
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleValidateProducts = async (fileId: string) => {
    const file = importedFiles.find(f => f.id === fileId);
    if (!file || !file.rawData) {
      toast.error(t('import.noDataToValidate', 'No data to validate'));
      return;
    }

    try {
      setCurrentFileId(fileId);
      setIsProcessing(true);
      
      setImportedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, validationStatus: 'in_progress' }
          : f
      ));

      // Run validation
      const validationSummary = await validateProducts(file.rawData, products);
      
      // Update file with validation results
      setImportedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              validationStatus: 'completed',
              validatedProducts: validationSummary.validatedProducts,
              validationSummary: validationSummary
            }
          : f
      ));

      // Set current validation data for popups
      setCurrentValidationData({
        validatedProducts: validationSummary.validatedProducts,
        summary: validationSummary,
        missingProducts: validationSummary.missingProducts
      });
      
      // Show validation popup with results
      setShowValidationPopup(true);
      
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(t('import.validationError', 'Error during validation'));
      
      setImportedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, validationStatus: 'failed' }
          : f
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidationPopupClose = () => {
    setShowValidationPopup(false);
    if (currentValidationData) {
      setShowValidationSummary(true);
    }
  };

  const handleShowMissingProducts = () => {
    setShowValidationSummary(false);
    setShowMissingProductsDialog(true);
  };

  const handleShowErrorLog = () => {
    setShowValidationSummary(false);
    setShowErrorLogTable(true);
  };

  const handleMissingProductsAction = (action: MissingProductAction) => {
    setSelectedMissingAction(action);
    setShowMissingProductsDialog(false);
    setShowValidationSummary(true);
    
    // In a real app, you would apply the action to missing products here
    toast.success(t('import.missingProductsActionSet', `Missing products will be ${action}`));
  };

  const handleSyncToDatabase = () => {
    if (!currentValidationData) return;
    
    setShowValidationSummary(false);
    setShowConfirmationDialog(true);
  };

  const handleConfirmSync = async () => {
    if (!currentValidationData || !currentFileId) return;

    try {
      setIsProcessing(true);
      
      setImportedFiles(prev => prev.map(f => 
        f.id === currentFileId 
          ? { ...f, updateStatus: 'in_progress' }
          : f
      ));

      // Process validated products
      for (const validatedProduct of currentValidationData.validatedProducts) {
        if (validatedProduct.validation.status === 'accepted') {
          if (validatedProduct.validation.action === 'insert') {
            await addProduct(validatedProduct);
          } else if (validatedProduct.validation.action === 'update') {
            await updateProduct(validatedProduct.business_product_id, validatedProduct);
          }
        }
      }

      // Update file status
      const now = new Date().toLocaleString();
      setImportedFiles(prev => prev.map(f => 
        f.id === currentFileId 
          ? { 
              ...f, 
              updateStatus: 'completed',
              lastUpdateDate: now,
              canRestore: true
            }
          : { ...f, canRestore: false }
      ));

      setShowConfirmationDialog(false);
      setCurrentValidationData(null);
      setCurrentFileId(null);
      
      toast.success(t('import.syncSuccess', 'Products synced successfully'));
      
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(t('import.syncError', 'Error syncing products'));
      
      setImportedFiles(prev => prev.map(f => 
        f.id === currentFileId! 
          ? { ...f, updateStatus: 'failed' }
          : f
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProducts = (fileId: string) => {
    setImportedFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, updateStatus: 'in_progress' }
        : file
    ));
    
    // Simulate update process
    setTimeout(() => {
      const now = new Date().toLocaleString();
      setImportedFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { 
              ...file, 
              updateStatus: 'completed',
              lastUpdateDate: now,
              canRestore: true
            }
          : { ...file, canRestore: false } // Only one file can be restored at a time
      ));
    }, 3000);
  };

  const handleRestoreProducts = (file: ImportedFile) => {
    setSelectedFileForRestore(file);
    setShowRestoreDialog(true);
  };

  const confirmRestore = () => {
    if (selectedFileForRestore) {
      setImportedFiles(prev => prev.map(file => 
        file.id === selectedFileForRestore.id 
          ? { ...file, restoreStatus: 'in_progress' }
          : file
      ));
      
      // Simulate restore process
      setTimeout(() => {
        setImportedFiles(prev => prev.map(file => 
          file.id === selectedFileForRestore.id 
            ? { ...file, restoreStatus: 'completed' }
            : file
        ));
      }, 2000);
      
      setShowRestoreDialog(false);
      setSelectedFileForRestore(null);
    }
  };

  const cancelRestore = () => {
    setShowRestoreDialog(false);
    setSelectedFileForRestore(null);
  };

  const toggleColumn = (column: keyof typeof selectedColumns) => {
    setSelectedColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('import.title')}
        </h1>
      </div>

      {/* Table Controls */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earthGreen"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </button>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earthGreen"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('common.export')}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earthGreen"
              >
                <Columns className="h-4 w-4 mr-2" />
                {t('common.columns')}
              </button>
              
              {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {Object.entries(selectedColumns).map(([column, isSelected]) => (
                      <label key={column} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleColumn(column as keyof typeof selectedColumns)}
                          className="mr-2 h-4 w-4 text-earthGreen focus:ring-earthGreen border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {t(`import.columns.${column}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

      {/* Validation Workflow Components */}
      {showValidationPopup && currentValidationData && (
        <ValidationPopup
          isOpen={showValidationPopup}
          onClose={handleValidationPopupClose}
          validationSummary={currentValidationData.summary}
          onProceedToSummary={handleValidationPopupClose}
        />
      )}

      {showValidationSummary && currentValidationData && (
        <ValidationSummaryComponent
          isOpen={showValidationSummary}
          onClose={() => setShowValidationSummary(false)}
          validationSummary={currentValidationData.summary}
          onShowMissingProducts={handleShowMissingProducts}
          onShowErrorLog={handleShowErrorLog}
          onSyncToDatabase={handleSyncToDatabase}
        />
      )}

      {showMissingProductsDialog && currentValidationData && (
        <MissingProductsDialog
          isOpen={showMissingProductsDialog}
          onClose={() => setShowMissingProductsDialog(false)}
          missingProducts={currentValidationData.missingProducts}
          onSelectAction={handleMissingProductsAction}
        />
      )}

      {showErrorLogTable && currentValidationData && (
        <ErrorLogTable
          isOpen={showErrorLogTable}
          onClose={() => setShowErrorLogTable(false)}
          validatedProducts={currentValidationData.validatedProducts}
        />
      )}

      {showConfirmationDialog && currentValidationData && (
        <ConfirmationDialog
          isOpen={showConfirmationDialog}
          onClose={() => setShowConfirmationDialog(false)}
          onConfirm={handleConfirmSync}
          summary={currentValidationData.summary}
          isLoading={isProcessing}
        />
      )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={handleNewImport}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-earthGreen hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-earthGreen disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('import.processing', 'Processing...')}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {t('import.newImport')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Imported Files Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-deepBrown">
              <tr>
                {selectedColumns.fileName && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t('import.columns.fileName')}
                  </th>
                )}
                {selectedColumns.uploadDate && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t('import.columns.uploadDate')}
                  </th>
                )}
                {selectedColumns.recordCount && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t('import.columns.recordCount')}
                  </th>
                )}
                {selectedColumns.status && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t('import.columns.status')}
                  </th>
                )}
                {selectedColumns.actions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {t('import.columns.actions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {importedFiles.map((file, index) => (
                <tr key={file.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {selectedColumns.fileName && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {file.fileName}
                        </div>
                      </div>
                    </td>
                  )}
                  {selectedColumns.uploadDate && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.uploadDate}
                    </td>
                  )}
                  {selectedColumns.recordCount && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.recordCount} records
                    </td>
                  )}
                  {selectedColumns.status && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t(`import.status.${file.status}`)}
                      </span>
                    </td>
                  )}
                  {selectedColumns.actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        {/* Validate Products Button */}
                        <button
                          onClick={() => handleValidateProducts(file.id)}
                          disabled={file.validationStatus === 'completed' || file.validationStatus === 'in_progress' || !file.rawData}
                          className={`text-left text-xs font-medium ${
                            file.validationStatus === 'completed'
                              ? 'text-gray-400 cursor-not-allowed'
                              : file.validationStatus === 'in_progress'
                              ? 'text-blue-500 cursor-not-allowed'
                              : !file.rawData
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-earthGreen hover:text-green-700 cursor-pointer'
                          }`}
                        >
                          {file.validationStatus === 'completed'
                            ? t('import.actions.validated')
                            : file.validationStatus === 'in_progress'
                            ? t('import.actions.validating')
                            : file.validationStatus === 'failed'
                            ? t('import.actions.validationFailed')
                            : t('import.actions.validateProducts')
                          }
                        </button>
                        
                        {/* Update Products Button */}
                        <button
                          onClick={() => handleUpdateProducts(file.id)}
                          disabled={file.validationStatus !== 'completed' || file.updateStatus === 'completed' || file.updateStatus === 'in_progress'}
                          className={`text-left text-xs font-medium ${
                            file.validationStatus !== 'completed' || file.updateStatus === 'completed'
                              ? 'text-gray-400 cursor-not-allowed'
                              : file.updateStatus === 'in_progress'
                              ? 'text-blue-500 cursor-not-allowed'
                              : 'text-earthGreen hover:text-green-700 cursor-pointer'
                          }`}
                        >
                          {file.updateStatus === 'completed'
                            ? t('import.actions.updated')
                            : file.updateStatus === 'in_progress'
                            ? t('import.actions.updating')
                            : t('import.actions.updateProducts')
                          }
                        </button>
                        
                        {/* Restore Button */}
                        <button
                          onClick={() => handleRestoreProducts(file)}
                          disabled={!file.canRestore || file.restoreStatus === 'completed' || file.restoreStatus === 'in_progress'}
                          className={`text-left text-xs font-medium ${
                            file.restoreStatus === 'completed'
                              ? 'text-gray-400 cursor-not-allowed'
                              : file.restoreStatus === 'in_progress'
                              ? 'text-blue-500 cursor-not-allowed'
                              : file.canRestore
                              ? 'text-orange-600 hover:text-orange-700 cursor-pointer'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {file.restoreStatus === 'completed'
                            ? t('import.actions.restored')
                            : file.restoreStatus === 'in_progress'
                            ? t('import.actions.restoring')
                            : t('import.actions.restore')
                          }
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      {showRestoreDialog && selectedFileForRestore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('import.restore.title')}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('import.restore.message', {
                  fileName: selectedFileForRestore.fileName,
                  date: selectedFileForRestore.lastUpdateDate
                })}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelRestore}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;