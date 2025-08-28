// Test script for product variants
import { createProductWithVariants, createSimpleProduct } from '@/utils/migration';

// Test creating a product with variants
const testProduct = createProductWithVariants(
  {
    name: 'Test T-Shirt',
    category: 'Apparel',
    price: 299,
    stock: 0, // Total stock will be calculated from variants
    barcode: 'TEST-001',
    description: 'Test product with variants',
    cost: 150,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  [
    { id: 'var-1', size: 'S', price: 299, stock: 10, barcode: 'TEST-S', isActive: true },
    { id: 'var-2', size: 'M', price: 349, stock: 15, barcode: 'TEST-M', isActive: true },
    { id: 'var-3', size: 'L', price: 399, stock: 8, barcode: 'TEST-L', isActive: true }
  ]
);

console.log('Test Product:', testProduct);

// Test creating a simple product
const simpleProduct = createSimpleProduct({
  name: 'Simple Coffee',
  category: 'Beverages',
  price: 150,
  stock: 50,
  barcode: 'COFFEE-001',
  description: 'Simple product without variants',
  cost: 75,
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log('Simple Product:', simpleProduct);
