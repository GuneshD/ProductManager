import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductSKU, TableColumn, SortConfig } from '../../types';
import { Edit2, Trash2, ChevronUp, ChevronDown, Save, X, Eye, ZoomIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductTableProps {
  products: ProductSKU[];
  columns: TableColumn[];
  onEdit: (product: ProductSKU) => void;
  onDelete: (productId: string) => void;
  onUpdate: (productId: string, updates: Partial<ProductSKU>) => void;
  sortConfig: SortConfig;
  onSort: (key: keyof ProductSKU) => void;
  loading?: boolean;
}

interface EditingCell {
  productId: string;
  field: keyof ProductSKU;
  value: any;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  columns,
  onEdit,
  onDelete,
  onUpdate,
  sortConfig,
  onSort,
  loading = false
}) => {
  const { t } = useTranslation();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const handleCellDoubleClick = (product: ProductSKU, field: keyof ProductSKU) => {
    // Only allow editing of certain fields
    const editableFields: (keyof ProductSKU)[] = [
      'product_sku_name',
      'uom_value',
      'in_box_units'
    ];
    
    if (!editableFields.includes(field)) {
      return;
    }

    setEditingCell({ productId: product.id, field, value: product[field] });
    setEditValue(String(product[field] || ''));
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    let processedValue: any = editValue;
    
    // Convert value based on field type
    if (editingCell.field === 'uom_value' || editingCell.field === 'in_box_units') {
      const numValue = parseFloat(editValue);
      if (isNaN(numValue)) {
        toast.error('Please enter a valid number');
        return;
      }
      processedValue = numValue;
    }

    onUpdate(editingCell.productId, { [editingCell.field]: processedValue });
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-gray-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-600" />
    );
  };

  const renderCellContent = (product: ProductSKU, column: TableColumn) => {
    const field = column.key as keyof ProductSKU;
    const value = product[field];
    const isEditing = editingCell?.productId === product.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-1">
          <input
            ref={inputRef}
            type={column.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveEdit}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Save className="h-3 w-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    // Format value based on column type
    let displayValue = value;
    
    if (column.key === 'sku_status') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {String(value)}
        </span>
      );
    }
    
    if (column.key === 'is_box' || column.key === 'is_combo') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'yes' ? t('common.yes') : t('common.no')}
        </span>
      );
    }
    
    if (column.type === 'number' && typeof value === 'number') {
      displayValue = value.toLocaleString();
    }
    
    if (column.key === 'created_at' && value) {
      displayValue = new Date(value as string).toLocaleDateString();
    }
    
    // Handle image column
    if (column.key === 'product_sku_image' && value) {
      return (
        <div className="flex items-center space-x-2">
          <img
            src={value as string}
            alt="Product"
            className="w-10 h-10 object-cover rounded border border-gray-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <button
            onClick={() => {
              setSelectedImage(value as string);
              setShowImageModal(true);
            }}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="View image"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      );
    }
    
    // Handle empty image column
    if (column.key === 'product_sku_image' && !value) {
      return (
        <span className="text-gray-400 text-sm italic">
          No image
        </span>
      );
    }

    return (
      <span>
        {String(displayValue || '')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-neutral-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-100 border-t border-neutral-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
        <p className="text-neutral-500">{t('products.noProducts')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-deepBrown">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-amber-900 transition-colors"
                  onClick={() => onSort(column.key as keyof ProductSKU)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {products.map((product, index) => (
              <tr key={product.id} className={`transition-colors ${
                index % 2 === 0 ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-50 hover:bg-neutral-100'
              }`}>
                {columns.map((column) => {
                  const field = column.key as keyof ProductSKU;
                  const isEditable = ['product_sku_name', 'uom_value', 'in_box_units'].includes(field as string);
                  
                  return (
                    <td 
                      key={column.key} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-900 ${
                        isEditable ? 'cursor-pointer hover:bg-blue-50' : ''
                      }`}
                      onDoubleClick={isEditable ? () => handleCellDoubleClick(product, field) : undefined}
                      title={isEditable ? 'Double-click to edit' : ''}
                    >
                      {renderCellContent(product, column)}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-skyBlue hover:text-blue-700 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('products.confirmDelete'))) {
                          onDelete(product.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with Row Count */}
      <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-700">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
          <p className="text-xs text-neutral-500">
            Double-click on name, UOM value, or box units to edit
          </p>
        </div>
      </div>
      
      {/* Image Zoom Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImage(null);
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Product image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;