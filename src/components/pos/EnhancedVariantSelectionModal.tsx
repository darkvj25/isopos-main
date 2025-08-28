import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, ProductVariant } from '@/types/pos';
import { formatPeso } from '@/utils/pos';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

interface EnhancedVariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant | null, quantity: number) => void;
  product: Product | null;
}

export const EnhancedVariantSelectionModal = ({ 
  isOpen, 
  onClose, 
  onAddToCart, 
  product 
}: EnhancedVariantSelectionModalProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.hasVariants && !selectedVariant) {
      return;
    }
    
    onAddToCart(product, selectedVariant, quantity);
    setSelectedVariant(null);
    setQuantity(1);
    onClose();
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const incrementQuantity = () => {
    const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getAvailableVariants = () => {
    return product.variants?.filter(variant => variant.isActive && variant.stock > 0) || [];
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock <= 5) return "warning";
    return "secondary";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span>Select Variant</span>
            <Badge variant="outline" className="ml-auto">{product.name}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{product.category}</p>
            {!product.hasVariants && (
              <p className="text-lg font-bold mt-2">{formatPeso(product.price)}</p>
            )}
          </div>

          {/* Variant Selection */}
          {product.hasVariants && getAvailableVariants().length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Choose Size/Variant</Label>
              <div className="space-y-2">
                {getAvailableVariants().map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 ring-2 ring-[hsl(var(--primary))]/20'
                        : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                    }`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-lg">{variant.size}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {formatPeso(variant.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStockBadgeVariant(variant.stock)}
                          className="text-xs"
                        >
                          {variant.stock} in stock
                        </Badge>
                        {selectedVariant?.id === variant.id && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.hasVariants && getAvailableVariants().length === 0 && (
            <div className="text-center py-8">
              <p className="text-[hsl(var(--muted-foreground))]">
                No variants available for this product
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-8 h-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={selectedVariant ? selectedVariant.stock : product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-lg font-semibold"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={incrementQuantity}
                disabled={quantity >= (selectedVariant ? selectedVariant.stock : product.stock)}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <span className="text-sm text-[hsl(var(--muted-foreground))] ml-auto">
                Max: {selectedVariant ? selectedVariant.stock : product.stock}
              </span>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-[hsl(var(--primary))]">
                {formatPeso((selectedVariant?.price || product.price) * quantity)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToCart}
            disabled={product.hasVariants && !selectedVariant}
            className="pos-button-primary"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart ({quantity})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
