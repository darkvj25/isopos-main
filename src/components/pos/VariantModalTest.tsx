import React from 'react';
import { useState } from 'react';
import { PosTerminal } from './PosTerminal';
import { Product } from '@/types/pos';

// Test component to demonstrate variant modal functionality
export const VariantModalTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sample product with variants for testing
  const sampleProduct: Product = {
    id: 'test-1',
    name: 'T-Shirt',
    category: 'Clothing',
    price: 299,
    stock: 0,
    hasVariants: true,
    variants: [
      {
        id: 'variant-1',
        size: 'Small',
        price: 299,
        stock: 10,
        isActive: true,
      },
      {
        id: 'variant-2',
        size: 'Medium',
        price: 349,
        stock: 5,
        isActive: true,
      },
      {
        id: 'variant-3',
        size: 'Large',
        price: 399,
        stock: 0,
        isActive: true,
      },
    ],
  };

  const handleAddToCart = (product: Product, variant: any, quantity: number) => {
    console.log('Adding to cart:', {
      product: product.name,
      variant: variant?.size,
      quantity,
      totalPrice: (variant?.price || product.price) * quantity
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Variant Selection Modal Test</h2>
      
      <div className="space-y-4">
        <Button 
          onClick={() => {
            setSelectedProduct(sampleProduct);
            setIsModalOpen(true);
          }}
          className="pos-button-primary"
        >
          Test Variant Modal
        </Button>

        <div className="space-y-2">
          <Button
            onClick={() => {
              setSelectedProduct(sampleProduct);
              setIsModalOpen(true);
            }}
            className="pos-button-primary"
          >
            Test Variant Modal
          </Button>
        </div>
      </div>
    </div>
  );
};
