import { ProductSKU, ValidatedProduct, ValidationResult, ValidationSummary, ImportAction, ValidationStatus } from '../types';

// Allowed currencies
const ALLOWED_CURRENCIES = ['Rs', 'EUR'];

/**
 * Validates a single product record
 */
export function validateProduct(
  product: ProductSKU,
  rowIndex: number,
  existingProducts: ProductSKU[],
  importData: ProductSKU[]
): ValidatedProduct {
  const errors: string[] = [];
  const warnings: string[] = [];
  let action: ImportAction = 'insert';
  let status: ValidationStatus = 'accepted';

  // Check if product already exists in database
  const existingProduct = existingProducts.find(
    p => p.business_product_id === product.business_product_id
  );

  if (existingProduct) {
    action = 'update';
  }

  // Validate MRP >= 0
  if (product.product_mrp < 0) {
    errors.push('MRP must be greater than or equal to 0');
  }

  // Validate currency
  if (!ALLOWED_CURRENCIES.includes(product.currency)) {
    errors.push(`Currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}`);
  }

  // Check for duplicates within import data
  const duplicates = importData.filter(
    (p, index) => 
      index !== rowIndex &&
      p.pricelist_id === product.pricelist_id &&
      p.business_product_id === product.business_product_id
  );

  if (duplicates.length > 0) {
    errors.push(`Duplicate entry: (${product.pricelist_id}, ${product.business_product_id}) appears multiple times in import file`);
  }

  // Validate required fields
  if (!product.business_product_id?.trim()) {
    errors.push('Business Product ID is required');
  }

  if (!product.pricelist_id?.trim()) {
    errors.push('Pricelist ID is required');
  }

  if (!product.product_name?.trim()) {
    errors.push('Product Name is required');
  }

  // Set status based on errors
  if (errors.length > 0) {
    status = 'error';
    action = 'skip';
  } else if (warnings.length > 0) {
    status = 'warning';
  }

  // Generate remark
  let remark = '';
  if (status === 'error') {
    remark = errors.join('; ');
  } else if (status === 'warning') {
    remark = warnings.join('; ');
  } else {
    remark = action === 'update' ? 'Product will be updated' : 'New product will be added';
  }

  const validation: ValidationResult = {
    status,
    action,
    errors,
    warnings,
    remark
  };

  return {
    ...product,
    validation,
    rowIndex
  };
}

/**
 * Validates an array of products and returns validation summary
 */
export function validateProducts(
  importData: ProductSKU[],
  existingProducts: ProductSKU[]
): ValidationSummary {
  const validatedProducts: ValidatedProduct[] = importData.map((product, index) =>
    validateProduct(product, index, existingProducts, importData)
  );

  // Find missing products (in DB but not in import file)
  const importProductIds = new Set(importData.map(p => p.business_product_id));
  const missingProducts = existingProducts.filter(
    p => p.product_status === 'active' && !importProductIds.has(p.business_product_id)
  );

  // Calculate summary statistics
  const totalRows = validatedProducts.length;
  const acceptedRows = validatedProducts.filter(p => p.validation.status === 'accepted').length;
  const errorRows = validatedProducts.filter(p => p.validation.status === 'error').length;
  const warningRows = validatedProducts.filter(p => p.validation.status === 'warning').length;
  const insertCount = validatedProducts.filter(p => p.validation.action === 'insert').length;
  const updateCount = validatedProducts.filter(p => p.validation.action === 'update').length;
  const skipCount = validatedProducts.filter(p => p.validation.action === 'skip').length;

  return {
    totalRows,
    acceptedRows,
    errorRows,
    warningRows,
    insertCount,
    updateCount,
    skipCount,
    missingProducts,
    validatedProducts
  };
}

/**
 * Checks if validation results are ready for database sync
 */
export function canSyncToDatabase(summary: ValidationSummary): boolean {
  return summary.errorRows === 0;
}

/**
 * Exports validation results to CSV format
 */
export function exportValidationResults(validatedProducts: ValidatedProduct[]): string {
  const headers = [
    'Row',
    'Status',
    'Action',
    'Business Product ID',
    'Pricelist ID',
    'Product Name',
    'MRP',
    'Currency',
    'Remark'
  ];

  const rows = validatedProducts.map(product => [
    product.rowIndex + 1,
    product.validation.status,
    product.validation.action,
    product.business_product_id,
    product.pricelist_id,
    product.product_name,
    product.product_mrp,
    product.currency,
    product.validation.remark
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Downloads validation results as CSV file
 */
export function downloadValidationResults(validatedProducts: ValidatedProduct[], filename: string = 'validation-results.csv'): void {
  const csvContent = exportValidationResults(validatedProducts);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}