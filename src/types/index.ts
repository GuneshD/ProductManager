// Base audit fields for all entities
export interface AuditFields {
  tenant_id: string;
  created_by: string;
  created_on: Date;
  modified_by: string;
  modified_on: Date;
}

// Status types
export type EntityStatus = 'active' | 'inactive' | 'paused';
export type ProductStatus = 'active' | 'inactive' | 'hide' | 'deleted';
export type UOMType = 'Kg' | 'mg' | 'Lit' | 'ml' | 'units';
export type YesNo = 'yes' | 'no';

// Import validation types
export type ValidationStatus = 'accepted' | 'error' | 'warning';
export type ImportAction = 'insert' | 'update' | 'skip';
export type MissingProductAction = 'show' | 'hide' | 'delete' | 'deactivate';

export interface ValidationResult {
  status: ValidationStatus;
  action: ImportAction;
  errors: string[];
  warnings: string[];
  remark: string;
}

export interface ValidatedProduct extends ProductSKU {
  validation: ValidationResult;
  rowIndex: number;
}

export interface ValidationSummary {
  totalRows: number;
  acceptedRows: number;
  errorRows: number;
  warningRows: number;
  insertCount: number;
  updateCount: number;
  skipCount: number;
  missingProducts: ProductSKU[];
  validatedProducts: ValidatedProduct[];
}

export interface MissingProductsDialog {
  products: ProductSKU[];
  selectedAction: MissingProductAction;
  isOpen: boolean;
}

// Category interface
export interface Category extends AuditFields {
  id: string;
  catg_name: string;
  catg_status: EntityStatus;
}

// Product Group interface
export interface ProductGroup extends AuditFields {
  id: string;
  product_group_name: string;
  product_group_image?: string;
  category_id: string;
  category?: Category;
}

// Product SKU interface
export interface ProductSKU extends AuditFields {
  id: string;
  business_id: string; // tenant_id (not shown in table)
  pricelist_id: string;
  pricelist_upload_date: string;
  pricelist_name: string;
  product_group: string;
  product_catg: string;
  product_name: string;
  product_description: string;
  product_uom: UOMType;
  product_uom_value: number;
  business_product_id: string;
  box_units: number;
  parent_product_id?: string;
  product_status: 'active' | 'inactive' | 'hide' | 'deleted';
  currency: string;
  product_mrp: number;
  sgst: number;
  cgst: number;
  igst: number;
  dealer_price: number;
  product_updated_by: string;
  product_verified_by: string;
  product_remark?: string;
}

// Hierarchical product view for table display
export interface ProductHierarchy {
  category: Category;
  groups: Array<{
    group: ProductGroup;
    skus: ProductSKU[];
  }>;
}

// CSV Import structure
export interface CSVProductData {
  tenant_id: string;
  catg_name: string;
  catg_status: EntityStatus;
  product_group_name: string;
  product_group_image?: string;
  product_sku_name: string;
  product_sku_id: string;
  UOM: UOMType;
  UOM_value: number;
  is_box: YesNo;
  in_box_units?: number;
  is_combo: YesNo;
  parent_product_sku_id?: string;
  SKU_stat: EntityStatus;
  product_sku_image?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface ProductFormData {
  category: {
    name: string;
    status: EntityStatus;
  };
  group: {
    name: string;
    image?: string;
  };
  sku: {
    name: string;
    sku_id: string;
    uom: UOMType;
    uom_value: number;
    is_box: YesNo;
    in_box_units?: number;
    is_combo: YesNo;
    parent_product_sku_id?: string;
    status: EntityStatus;
    image?: string;
  };
}

// Table column types for Excel-like interface
export interface TableColumn {
  id: string;
  header: string;
  label: string;
  key: string;
  accessorKey: string;
  cell?: (info: any) => React.ReactNode;
  enableSorting?: boolean;
  enableEditing?: boolean;
  type?: 'text' | 'select' | 'number' | 'image';
  options?: Array<{ value: string; label: string }>;
}

// Offline sync types
export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'category' | 'group' | 'sku';
  data: any;
  timestamp: Date;
  tenant_id: string;
}

// User and tenant types
export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  roles: string[];
}

export interface Tenant {
  id: string;
  name: string;
  status: EntityStatus;
  created_on: Date;
}

// Filter and search types
export interface ProductFilters {
  pricelist_id?: string;
  product_group?: string;
  product_name?: string;
  product_uom?: string;
  product_status?: ProductStatus;
  currency?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}