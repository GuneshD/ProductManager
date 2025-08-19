# Mock Data Files for Product Import Validation Testing

This directory contains sample CSV files designed to test various validation scenarios in the Product Manager application.

## Files Overview

### 1. `valid-products.csv`
**Purpose**: Contains only valid product data
- 10 products with correct format
- All required fields present
- Valid MRP values and INR currency
- No duplicates or errors

**Use Case**: Test successful import and validation workflow

### 2. `products-with-errors.csv`
**Purpose**: Contains various validation errors
- Duplicate product IDs (PROD001)
- Invalid MRP values (negative, zero, non-numeric)
- Currency mismatches (USD, EUR, GBP, JPY)
- Missing required fields (name, category, productId)
- Unsupported currencies

**Use Case**: Test error detection and error log functionality

### 3. `mixed-validation-test.csv`
**Purpose**: Mix of valid products and updates
- Contains existing product updates (PROD001)
- New valid products (PROD025-PROD038)
- Tests update vs insert logic

**Use Case**: Test validation summary with both updates and inserts

### 4. `missing-products-test.csv`
**Purpose**: Products not in the current database
- All products have IDs starting with "MISSING"
- Valid format but don't exist in database
- Tests missing products dialog functionality

**Use Case**: Test missing products handling (Show/Hide/Delete/Deactivate options)

### 5. `comprehensive-validation-test.csv`
**Purpose**: Complete test scenario with all validation cases
- Valid updates for existing products
- New valid products
- Duplicate product IDs
- Various validation errors
- Missing products
- Mix of all scenarios

**Use Case**: Complete end-to-end validation workflow testing

## How to Use

1. **Start the application**: Ensure the development server is running
2. **Navigate to Import Page**: Go to the import section
3. **Upload a test file**: Choose one of the mock CSV files
4. **Trigger validation**: Click the validate button
5. **Review results**: Check validation popup, summary, error logs, and missing products dialog

## Expected Validation Results

### For `comprehensive-validation-test.csv`:
- **Updates**: 3 products (PROD001, PROD002, PROD010)
- **Inserts**: 6 valid new products
- **Errors**: 8 products with various validation issues
- **Missing**: 3 products not in database
- **Duplicates**: 1 duplicate product ID (DUP001)

### Validation Error Types to Expect:
- ❌ Duplicate product IDs
- ❌ Negative MRP values
- ❌ Invalid MRP format (non-numeric)
- ❌ Currency mismatches
- ❌ Missing required fields
- ❌ Zero MRP values

### Success Scenarios:
- ✅ Valid product updates
- ✅ Valid new product inserts
- ✅ Proper currency format (INR)
- ✅ Complete required fields

## Testing Workflow

1. **Upload** → Choose a mock file
2. **Validate** → Trigger validation process
3. **Review Popup** → Check validation results with color coding
4. **Check Summary** → Review update/insert/error counts
5. **Handle Missing** → Test missing products dialog options
6. **View Error Log** → Check detailed error information
7. **Export Results** → Test CSV export functionality
8. **Confirm Sync** → Test final confirmation dialog

These files provide comprehensive coverage of all validation scenarios implemented in the Product Manager application.