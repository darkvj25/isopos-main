// Migration utilities for adding variant support to products

import { Product, ProductVariant } from '@/types/pos';

export const migrateProducts = (products: Product[]): Product[] => {
  return products.map(product => ({
    ...product,
    hasVariants: false,
    variants: undefined,
  }));
};

export const createProductWithVariants = (
  baseProduct: Omit<Product, 'hasVariants' | 'variants' | 'id'>,
  variants: ProductVariant[]
): Product => {
  return {
    ...baseProduct,
    id: crypto.randomUUID(),
    hasVariants: true,
    variants,
  };
};

export const createSimpleProduct = (
  product: Omit<Product, 'hasVariants' | 'variants' | 'id'>
): Product => {
  return {
    ...product,
    id: crypto.randomUUID(),
    hasVariants: false,
    variants: undefined,
  };
};

// Helper to get variant price
export const getVariantPrice = (product: Product, size: string): number => {
  if (!product.hasVariants || !product.variants) {
    return product.price;
  }
  
  const variant = product.variants.find(v => v.size === size && v.isActive);
  return variant ? variant.price : product.price;
};

// Helper to get variant stock
export const getVariantStock = (product: Product, size: string): number => {
  if (!product.hasVariants || !product.variants) {
    return product.stock;
  }
  
  const variant = product.variants.find(v => v.size === size && v.isActive);
  return variant ? variant.stock : product.stock;
};

// Helper to get available sizes
export const getAvailableSizes = (product: Product): string[] => {
  if (!product.hasVariants || !product.variants) {
    return [];
  }
  
  return product.variants
    .filter(v => v.isActive && v.stock > 0)
    .map(v => v.size);
};
