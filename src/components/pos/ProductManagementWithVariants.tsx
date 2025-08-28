import { useState } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Grid3X3
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/pos';
import { formatPeso, isLowStock, isOutOfStock } from '@/utils/pos';
import { toast } from '@/hooks/use-toast';

export const ProductManagementWithVariants = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, searchProducts } = usePosData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    barcode: '',
    description: '',
    hasVariants: false,
    variants: [] as ProductVariant[]
  });

  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products;

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      barcode: '',
      description: '',
      hasVariants: false,
      variants: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.hasVariants && formData.variants.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one size variant",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      ...formData,
      variants: formData.hasVariants ? formData.variants : undefined
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully`,
      });
      setEditingProduct(null);
    } else {
      addProduct(productData);
      toast({
        title: "Product Added",
        description: `${formData.name} has been added successfully`,
      });
      setShowAddDialog(false);
    }
    
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost || 0,
      stock: product.stock,
      barcode: product.barcode || '',
      description: product.description || '',
      hasVariants: product.hasVariants || false,
      variants: product.variants || []
    });
    setEditingProduct(product);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted`,
      });
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.hasVariants && product.variants) {
      const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
      if (totalStock === 0) {
        return { status: 'Out of Stock', color: 'destructive' as const, icon: AlertTriangle };
      }
      if (totalStock <= 5) {
        return { status: 'Low Stock', color: 'warning' as const, icon: AlertTriangle };
      }
      return { status: 'In Stock', color: 'secondary' as const, icon: CheckCircle };
    }

    if (isOutOfStock(product)) {
      return { status: 'Out of Stock', color: 'destructive' as const, icon: AlertTriangle };
    }
    if (isLowStock(product)) {
      return { status: 'Low Stock', color: 'warning' as const, icon: AlertTriangle };
    }
    return { status: 'In Stock', color: 'secondary' as const, icon: CheckCircle };
  };

  const getDisplayPrice = (product: Product) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice ? formatPeso(minPrice) : `${formatPeso(minPrice)} - ${formatPeso(maxPrice)}`;
    }
    return formatPeso(product.price);
  };

  const getTotalStock = (product: Product) => {
    if (product.hasVariants && product.variants) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return product.stock;
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: crypto.randomUUID(),
      size: '',
      price: formData.price,
      stock: 0,
      isActive: true
    };
    setFormData({...formData, variants: [...formData.variants, newVariant]});
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({...formData, variants: newVariants});
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({...formData, variants: newVariants});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Product Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Manage your store inventory and product catalog with size variants
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="pos-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Base Price (₱) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost Price (₱)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Base Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="barcode">Barcode (Optional)</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="Product barcode"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasVariants"
                  checked={formData.hasVariants}
                  onChange={(e) => setFormData({...formData, hasVariants: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="hasVariants" className="font-medium">Has Size Variants</Label>
              </div>

              {formData.hasVariants && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Size Variants</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Size
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                      <div key={variant.id} className="grid grid-cols-5 gap-2 items-center">
                        <Input
                          placeholder="Size (e.g., S, M, L)"
                          value={variant.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="col-span-1"
                        />
                        <Input
                          type="number"
                          placeholder="Price"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                        />
                        <Input
                          placeholder="Barcode"
                          value={variant.barcode || ''}
                          onChange={(e) => updateVariant(index, 'barcode', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
