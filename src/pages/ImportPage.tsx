import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../contexts/ProductContext';
import { useTenant } from '../contexts/TenantContext';
import { CSVProductData, EntityStatus, UOMType, YesNo } from '../types';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errors: Array<{ row: number; message: string }>;
}

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const { addProduct } = useProducts();
  const { getTenantId, currentUser } = useTenant();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<CSVProductData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const requiredColumns = [
    'tenant_id',
    'catg_name',
    'catg_status',
    'product_group_name',
    'product_sku_name',
    'product_sku_id',
    'UOM',
    'UOM_value',
    'is_box',
    'is_combo',
    'SKU_stat'
  ];

  const optionalColumns = [
    'product_group_image',
    'in_box_units',
    'parent_product_sku_id',
    'product_sku_image'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error(t('import.invalidFile'));
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  const parseCSV = (csvText: string): CSVProductData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: CSVProductData[] = [];

    // Validate required columns
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate and convert data types
      try {
        const csvRow: CSVProductData = {
          tenant_id: row.tenant_id,
          catg_name: row.catg_name,
          catg_status: row.catg_status as EntityStatus,
          product_group_name: row.product_group_name,
          product_group_image: row.product_group_image || undefined,
          product_sku_name: row.product_sku_name,
          product_sku_id: row.product_sku_id,
          UOM: row.UOM as UOMType,
          UOM_value: parseFloat(row.UOM_value) || 1,
          is_box: row.is_box as YesNo,
          in_box_units: row.in_box_units ? parseInt(row.in_box_units) : undefined,
          is_combo: row.is_combo as YesNo,
          parent_product_sku_id: row.parent_product_sku_id || undefined,
          SKU_stat: row.SKU_stat as EntityStatus,
          product_sku_image: row.product_sku_image || undefined
        };

        // Validate enum values
        if (!['active', 'inactive', 'paused'].includes(csvRow.catg_status)) {
          throw new Error(`Invalid category status: ${csvRow.catg_status}`);
        }
        if (!['active', 'inactive', 'paused'].includes(csvRow.SKU_stat)) {
          throw new Error(`Invalid SKU status: ${csvRow.SKU_stat}`);
        }
        if (!['Kg', 'mg', 'Lit', 'ml', 'units'].includes(csvRow.UOM)) {
          throw new Error(`Invalid UOM: ${csvRow.UOM}`);
        }
        if (!['yes', 'no'].includes(csvRow.is_box)) {
          throw new Error(`Invalid is_box value: ${csvRow.is_box}`);
        }
        if (!['yes', 'no'].includes(csvRow.is_combo)) {
          throw new Error(`Invalid is_combo value: ${csvRow.is_combo}`);
        }

        data.push(csvRow);
      } catch (error) {
        throw new Error(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    return data;
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows
      setShowPreview(true);
      toast.success(`Preview loaded: ${data.length} rows found`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    const tenantId = getTenantId();
    const userId = currentUser?.id;

    if (!tenantId || !userId) {
      toast.error('Missing tenant or user information');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);
      
      const result: ImportResult = {
        success: true,
        totalRows: data.length,
        successfulRows: 0,
        errors: []
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        try {
          const row = data[i];
          
          // Validate tenant_id matches current tenant
          if (row.tenant_id !== tenantId) {
            throw new Error(`Tenant ID mismatch. Expected: ${tenantId}, Found: ${row.tenant_id}`);
          }

          // Create product from CSV data
          const productData = {
            product_sku_name: row.product_sku_name,
            product_sku_id: row.product_sku_id,
            uom: row.UOM,
            uom_value: row.UOM_value,
            is_box: row.is_box,
            in_box_units: row.in_box_units,
            is_combo: row.is_combo,
            parent_product_sku_id: row.parent_product_sku_id,
            sku_status: row.SKU_stat,
            product_sku_image: row.product_sku_image,
            product_group_id: 'group-1' // In a real app, you'd create/find the group
          };

          await addProduct(productData);
          result.successfulRows++;
        } catch (error) {
          result.errors.push({
            row: i + 2, // +2 because CSV is 1-indexed and we skip header
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      result.success = result.errors.length === 0;
      setImportResult(result);

      if (result.success) {
        toast.success(t('import.importSuccess'));
      } else {
        toast.error(`Import completed with ${result.errors.length} errors`);
      }
    } catch (error) {
      setImportResult({
        success: false,
        totalRows: 0,
        successfulRows: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Failed to import' }]
      });
      toast.error(t('import.importError'));
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [...requiredColumns, ...optionalColumns];
    const sampleData = [
      'tenant-1',
      'Electronics',
      'active',
      'Smartphones',
      'smartphone.jpg',
      'iPhone 15 Pro',
      'IPH15PRO',
      'units',
      '1',
      'yes',
      '1',
      'no',
      '',
      'active',
      'iphone15pro.jpg'
    ];

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template downloaded successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('import.title')}
        </h1>
        <p className="text-gray-600 mt-1">
          Upload a CSV file to import multiple products at once
        </p>
      </div>

      {/* CSV Format Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          {t('import.csvFormat')}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              {t('import.requiredColumns')}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {requiredColumns.map(col => (
                <li key={col} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  {col}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-800 mb-2">
              Optional Columns
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {optionalColumns.map(col => (
                <li key={col} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                  {col}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            {t('import.downloadTemplate')}
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {selectedFile ? selectedFile.name : t('import.selectFile')}
              </span>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFileSelect}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              CSV files only, up to 10MB
            </p>
          </div>
          
          {!selectedFile && (
            <div className="mt-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Actions */}
      {selectedFile && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Preview Data
          </button>
          
          <button
            onClick={handleImport}
            disabled={importing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className={`h-4 w-4 mr-2 ${importing ? 'animate-spin' : ''}`} />
            {importing ? 'Importing...' : t('import.uploadFile')}
          </button>
          
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewData([]);
              setShowPreview(false);
              setImportResult(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Preview Data */}
      {showPreview && previewData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Data Preview (First 5 rows)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product_sku_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product_sku_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.catg_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.product_group_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.UOM}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.SKU_stat === 'active' ? 'bg-green-100 text-green-800' :
                        row.SKU_stat === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {row.SKU_stat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className={`border rounded-lg p-6 ${
          importResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <h3 className={`text-lg font-medium ${
              importResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              Import {importResult.success ? 'Successful' : 'Completed with Errors'}
            </h3>
          </div>
          
          <div className={`mt-2 text-sm ${
            importResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            <p>Total rows: {importResult.totalRows}</p>
            <p>Successful: {importResult.successfulRows}</p>
            <p>Errors: {importResult.errors.length}</p>
          </div>
          
          {importResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <li key={index}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportPage;