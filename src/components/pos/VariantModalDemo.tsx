import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedVariantSelectionModal } from './EnhancedVariantSelectionModal';
import { Product } from '@/types/pos';

// Demo component to show variant modal functionality
export const VariantModalDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Sample product with variants
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
      <h2 className="text-2xl font-bold mb-4">Variant Selection Modal Demo</h2>
      
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

        <EnhancedVariantSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCart}
          product={selectedProduct}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Integration Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Modal opens when clicking "Add to Cart" on products with variants</li>
          <li>Users can select specific size/variant before adding to cart</li>
          <li>Quantity can be adjusted within the modal</li>
          <li>Stock levels are clearly displayed for each variant</li>
          <li>Out of stock variants are disabled</li>
          <li>Total price updates based on selected variant and quantity</li>
        </ul>
      </div>
    </div>
  );
};
