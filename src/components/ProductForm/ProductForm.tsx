import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ProductFormData, ProductSKU, EntityStatus, UOMType, YesNo } from '../../types';
import { X, Save, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductFormProps {
  product?: ProductSKU;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Validation schema
const productSchema = z.object({
  product_sku_name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  product_sku_id: z.string().min(1, 'SKU ID is required').max(50, 'SKU ID too long'),
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
  sku_status: z.enum(['active', 'inactive', 'paused'], {
    errorMap: () => ({ message: 'Please select a valid status' })
  }),
  product_sku_image: z.string().optional(),
  product_group_id: z.string().min(1, 'Product group is required')
}).refine((data) => {
  // If is_box is 'yes', in_box_units should be provided
  if (data.is_box === 'yes' && (!data.in_box_units || data.in_box_units <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Box units are required when product is a box',
  path: ['in_box_units']
}).refine((data) => {
  // If is_combo is 'yes', parent_product_sku_id should be provided
  if (data.is_combo === 'yes' && !data.parent_product_sku_id) {
    return false;
  }
  return true;
}, {
  message: 'Parent SKU ID is required for combo products',
  path: ['parent_product_sku_id']
});

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { t } = useTranslation();
  const isEditing = !!product;

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
      product_sku_name: '',
      product_sku_id: '',
      uom: 'units',
      uom_value: 1,
      is_box: 'no',
      in_box_units: undefined,
      is_combo: 'no',
      parent_product_sku_id: '',
      sku_status: 'active',
      product_sku_image: '',
      product_group_id: 'group-1' // Default group
    }
  });

  const watchIsBox = watch('is_box');
  const watchIsCombo = watch('is_combo');

  useEffect(() => {
    if (product) {
      reset({
        product_sku_name: product.product_sku_name,
        product_sku_id: product.product_sku_id,
        uom: product.uom,
        uom_value: product.uom_value,
        is_box: product.is_box,
        in_box_units: product.in_box_units,
        is_combo: product.is_combo,
        parent_product_sku_id: product.parent_product_sku_id || '',
        sku_status: product.sku_status,
        product_sku_image: product.product_sku_image || '',
        product_group_id: product.product_group_id
      });
    }
  }, [product, reset]);

  const handleFormSubmit = (data: ProductFormData) => {
    // Clean up data based on conditions
    const cleanedData = { ...data };
    
    if (data.is_box === 'no') {
      cleanedData.in_box_units = undefined;
    }
    
    if (data.is_combo === 'no') {
      cleanedData.parent_product_sku_id = undefined;
    }
    
    if (!data.product_sku_image?.trim()) {
      cleanedData.product_sku_image = undefined;
    }

    onSubmit(cleanedData);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // In a real app, you would upload to a server and get back a URL
      // For now, we'll just use the file name
      setValue('product_sku_image', file.name);
      toast.success('Image selected successfully');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? t('products.editProduct') : t('products.addProduct')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.productName')} *
              </label>
              <input
                type="text"
                {...register('product_sku_name')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.product_sku_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.product_sku_name && (
                <p className="mt-1 text-sm text-red-600">{errors.product_sku_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.skuId')} *
              </label>
              <input
                type="text"
                {...register('product_sku_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.product_sku_id ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter SKU ID"
              />
              {errors.product_sku_id && (
                <p className="mt-1 text-sm text-red-600">{errors.product_sku_id.message}</p>
              )}
            </div>
          </div>

          {/* UOM Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.uom')} *
              </label>
              <select
                {...register('uom')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.uom ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="units">Units</option>
                <option value="Kg">Kilogram (Kg)</option>
                <option value="mg">Milligram (mg)</option>
                <option value="Lit">Liter (Lit)</option>
                <option value="ml">Milliliter (ml)</option>
              </select>
              {errors.uom && (
                <p className="mt-1 text-sm text-red-600">{errors.uom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.uomValue')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('uom_value', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.uom_value ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter UOM value"
              />
              {errors.uom_value && (
                <p className="mt-1 text-sm text-red-600">{errors.uom_value.message}</p>
              )}
            </div>
          </div>

          {/* Box Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.isBox')} *
              </label>
              <select
                {...register('is_box')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.is_box ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              {errors.is_box && (
                <p className="mt-1 text-sm text-red-600">{errors.is_box.message}</p>
              )}
            </div>

            {watchIsBox === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.inBoxUnits')} *
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('in_box_units', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.in_box_units ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter units in box"
                />
                {errors.in_box_units && (
                  <p className="mt-1 text-sm text-red-600">{errors.in_box_units.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Combo Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.isCombo')} *
              </label>
              <select
                {...register('is_combo')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.is_combo ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              {errors.is_combo && (
                <p className="mt-1 text-sm text-red-600">{errors.is_combo.message}</p>
              )}
            </div>

            {watchIsCombo === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.parentSkuId')} *
                </label>
                <input
                  type="text"
                  {...register('parent_product_sku_id')}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.parent_product_sku_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter parent SKU ID"
                />
                {errors.parent_product_sku_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_product_sku_id.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Status and Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.status')} *
              </label>
              <select
                {...register('sku_status')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.sku_status ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>
              {errors.sku_status && (
                <p className="mt-1 text-sm text-red-600">{errors.sku_status.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.productGroup')} *
              </label>
              <select
                {...register('product_group_id')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.product_group_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="group-1">Electronics</option>
                <option value="group-2">Clothing</option>
                <option value="group-3">Food & Beverages</option>
                <option value="group-4">Home & Garden</option>
              </select>
              {errors.product_group_id && (
                <p className="mt-1 text-sm text-red-600">{errors.product_group_id.message}</p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.productImage')}
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                {...register('product_sku_image')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Image URL or file name"
                readOnly
              />
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Upload an image (max 5MB) or enter an image URL
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Saving...' : isEditing ? t('common.update') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;