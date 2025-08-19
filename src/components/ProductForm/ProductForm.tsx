import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ProductFormData, ProductSKU, EntityStatus, UOMType, YesNo } from '../../types';
import { X, Save, Upload, ZoomIn, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  product?: ProductSKU;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Validation schema
const productSchema = z.object({
  category: z.object({
    name: z.string().min(1, 'Category name is required'),
    status: z.enum(['active', 'inactive', 'paused'])
  }),
  group: z.object({
    name: z.string().min(1, 'Group name is required'),
    image: z.string().optional()
  }),
  sku: z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
    sku_id: z.string().min(1, 'SKU ID is required').max(50, 'SKU ID too long'),
    uom: z.enum(['Kg', 'mg', 'Lit', 'ml', 'units'], {
      errorMap: () => ({ message: 'Please select a valid unit of measure' })
    }),
    uom_value: z.number().min(0.01, 'UOM value must be greater than 0'),
    is_box: z.enum(['yes', 'no'], {
      errorMap: () => ({ message: 'Please select if this is a box product' })
    }),
    in_box_units: z.number().optional(),
    is_combo: z.enum(['yes', 'no'], {
      errorMap: () => ({ message: 'Please select if this is a combo product' })
    }),
    parent_product_sku_id: z.string().optional(),
    status: z.enum(['active', 'inactive', 'paused'], {
      errorMap: () => ({ message: 'Please select a valid status' })
    }),
    image: z.string().optional()
  })
}).refine((data) => {
  // If is_box is 'yes', in_box_units should be provided
  if (data.sku.is_box === 'yes' && (!data.sku.in_box_units || data.sku.in_box_units <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Box units are required when product is a box',
  path: ['sku', 'in_box_units']
}).refine((data) => {
  // If is_combo is 'yes', parent_product_sku_id should be provided
  if (data.sku.is_combo === 'yes' && !data.sku.parent_product_sku_id) {
    return false;
  }
  return true;
}, {
  message: 'Parent SKU ID is required for combo products',
  path: ['sku', 'parent_product_sku_id']
});

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { t } = useTranslation();
  const isEditing = !!product;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: {
        name: 'Default Category',
        status: 'active'
      },
      group: {
        name: 'Default Group',
        image: ''
      },
      sku: {
        name: '',
        sku_id: '',
        uom: 'units',
        uom_value: 1,
        is_box: 'no',
        in_box_units: undefined,
        is_combo: 'no',
        parent_product_sku_id: '',
        status: 'active',
        image: ''
      }
    }
  });

  const watchIsBox = watch('sku.is_box');
  const watchIsCombo = watch('sku.is_combo');

  useEffect(() => {
    if (product) {
      reset({
        category: {
          name: product.product_group?.category?.catg_name || 'Default Category',
          status: product.product_group?.category?.catg_status || 'active'
        },
        group: {
          name: product.product_group?.product_group_name || 'Default Group',
          image: product.product_group?.product_group_image || ''
        },
        sku: {
          name: product.product_sku_name,
          sku_id: product.product_sku_id,
          uom: product.uom,
          uom_value: product.uom_value,
          is_box: product.is_box,
          in_box_units: product.in_box_units,
          is_combo: product.is_combo,
          parent_product_sku_id: product.parent_product_sku_id || '',
          status: product.sku_status,
          image: product.product_sku_image || ''
        }
      });
      
      // Set image preview if product has an image
      if (product.product_sku_image) {
        setImagePreview(product.product_sku_image);
      }
    }
  }, [product, reset]);

  const handleFormSubmit = (data: ProductFormData) => {
    // Clean up data based on conditions
    const cleanedData = { ...data };
    
    if (data.sku.is_box === 'no') {
      cleanedData.sku.in_box_units = undefined;
    }
    
    if (data.sku.is_combo === 'no') {
      cleanedData.sku.parent_product_sku_id = undefined;
    }
    
    if (!data.sku.image?.trim()) {
      cleanedData.sku.image = undefined;
    }

    onSubmit(cleanedData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size - 50KB limit
      if (file.size > 50 * 1024) {
        toast.error('Image size should be less than 50KB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setValue('sku.image', result);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('sku.image', '');
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">
            {isEditing ? t('products.editProduct') : t('products.addProduct')}
          </h2>
          <button
            onClick={onCancel}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Category Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                Category Name *
              </label>
              <input
                type="text"
                {...register('category.name')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.category?.name ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="Enter category name"
              />
              {errors.category?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.category.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                Category Status *
              </label>
              <select
                {...register('category.status')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.category?.status ? 'border-red-300' : 'border-neutral-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>
              {errors.category?.status && (
                <p className="mt-1 text-sm text-red-600">{errors.category.status.message}</p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.productName')} *
              </label>
              <input
                type="text"
                {...register('sku.name')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.name ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.sku?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.skuId')} *
              </label>
              <input
                type="text"
                {...register('sku.sku_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.sku_id ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="Enter SKU ID"
              />
              {errors.sku?.sku_id && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.sku_id.message}</p>
              )}
            </div>
          </div>

          {/* UOM Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.uom')} *
              </label>
              <select
                {...register('sku.uom')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.uom ? 'border-red-300' : 'border-neutral-300'
                }`}
              >
                <option value="units">Units</option>
                <option value="Kg">Kilogram (Kg)</option>
                <option value="mg">Milligram (mg)</option>
                <option value="Lit">Liter (Lit)</option>
                <option value="ml">Milliliter (ml)</option>
              </select>
              {errors.sku?.uom && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.uom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.uomValue')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('sku.uom_value', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.uom_value ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="Enter UOM value"
              />
              {errors.sku?.uom_value && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.uom_value.message}</p>
              )}
            </div>
          </div>

          {/* Box Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.isBox')} *
              </label>
              <select
                {...register('sku.is_box')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.is_box ? 'border-red-300' : 'border-neutral-300'
                }`}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              {errors.sku?.is_box && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.is_box.message}</p>
              )}
            </div>

            {watchIsBox === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-formGray mb-2">
                  {t('products.inBoxUnits')} *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('sku.in_box_units', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                    errors.sku?.in_box_units ? 'border-red-300' : 'border-neutral-300'
                  }`}
                  placeholder="Enter units in box"
                />
                {errors.sku?.in_box_units && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.in_box_units.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Combo Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.isCombo')} *
              </label>
              <select
                {...register('sku.is_combo')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.is_combo ? 'border-red-300' : 'border-neutral-300'
                }`}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              {errors.sku?.is_combo && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.is_combo.message}</p>
              )}
            </div>

            {watchIsCombo === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-formGray mb-2">
                  {t('products.parentSkuId')} *
                </label>
                <input
                  type="text"
                  {...register('sku.parent_product_sku_id')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                    errors.sku?.parent_product_sku_id ? 'border-red-300' : 'border-neutral-300'
                  }`}
                  placeholder="Enter parent SKU ID"
                />
                {errors.sku?.parent_product_sku_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.parent_product_sku_id.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Status and Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.status')} *
              </label>
              <select
                {...register('sku.status')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.sku?.status ? 'border-red-300' : 'border-neutral-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>
              {errors.sku?.status && (
                <p className="mt-1 text-sm text-red-600">{errors.sku.status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-formGray mb-2">
                {t('products.productGroup')} *
              </label>
              <input
                type="text"
                {...register('group.name')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-earthGreen focus:border-earthGreen ${
                  errors.group?.name ? 'border-red-300' : 'border-neutral-300'
                }`}
                placeholder="Enter product group name"
              />
              {errors.group?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.group.name.message}</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-formGray mb-2">
              {t('products.productImage')}
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 relative inline-block">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover border border-neutral-300 rounded-lg shadow-sm"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-neutral-50 transition-colors"
                    title="Zoom image"
                  >
                    <ZoomIn className="h-4 w-4 text-neutral-600" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1 bg-white rounded-full shadow-md hover:bg-neutral-50 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <input
                type="hidden"
                {...register('sku.image')}
              />
              <label className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Upload an image (max 50KB). Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-earthGreen hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Saving...' : isEditing ? t('common.update') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
      
      {/* Image Zoom Modal */}
      {showImageModal && imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={imagePreview}
              alt="Product image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;