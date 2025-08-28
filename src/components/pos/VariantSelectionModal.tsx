import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, ProductVariant } from '@/types/pos';
import { formatPeso } from '@/utils/pos';
import { Plus, Minus } from 'lucide-react';

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant | null, quantity: number) => void;
  product: Product | null;
}

export const VariantSelectionModal = ({ 
  isOpen, 
  onClose, 
  onAddToCart, 
  product 
}: VariantSelectionModalProps) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Select Variant</span>
            <Badge variant="outline">{product.name}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {product.hasVariants && getAvailableVariants().length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Choose Size/Variant</Label>
              <div className="grid gap-2">
                {getAvailableVariants().map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]'
                    }`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{variant.size}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {formatPeso(variant.price)}
                        </p>
                      </div>
                      <Badge variant={variant.stock > 10 ? "secondary" : "warning"}>
                        {variant.stock} in stock
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!product.hasVariants && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Product Details</Label>
              <div className="p-3 border rounded-lg bg-[hsl(var(--muted))]">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {formatPeso(product.price)} • {product.stock} in stock
                </p>
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-2 block">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min="1"
                max={selectedVariant ? selectedVariant.stock : product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 text-center"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={incrementQuantity}
                disabled={quantity >= (selectedVariant ? selectedVariant.stock : product.stock)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold">
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
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
