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
  CheckCircle
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/pos';
import { formatPeso, isLowStock, isOutOfStock } from '@/utils/pos';
import { generateUUID } from '@/utils/uuid';
import { toast } from '@/hooks/use-toast';

export const getStockStatus = (product: Product) => {
  console.log(`Checking stock status for product: ${product.name}`); // Debugging line
  const totalStock = product.variants && product.variants.length > 0
      ? product.variants.reduce((total, variant) => {
          console.log(`Variant: ${variant.size}, Stock: ${variant.stock}`); // Debugging line
          return total + variant.stock;
      }, 0) 
      : product.stock;

  console.log(`Total Stock for ${product.name}: ${totalStock}`); // Debugging line

  if (isOutOfStock(product)) {
    return { status: 'Out of Stock', color: 'destructive' as const, icon: AlertTriangle };
  } else if (isLowStock(product)) {
    return { status: 'Low Stock', color: 'warning' as const, icon: AlertTriangle };
  }
  return { status: 'In Stock', color: 'secondary' as const, icon: CheckCircle };
};

export const ProductManagement = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = usePosData();
  
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

  const filteredProducts = searchQuery 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

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

const handleSubmit = (event: React.FormEvent) => {
    console.log("Submitting product:", formData); // Debugging line
     event.preventDefault();
    
    if (!formData.name || !formData.category || (!formData.hasVariants && formData.price <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.hasVariants) {
      // Validate variants
      for (const variant of formData.variants) {
        if (!variant.size || variant.price <= 0) {
          toast({
            title: "Validation Error",
            description: "Please fill in all variant sizes and prices",
            variant: "destructive",
          });
          return;
        }
      }
    }

    console.log("Adding product with variants:", formData); // Debugging line
    const totalVariantStock = formData.variants.reduce((total, variant) => total + variant.stock, 0);
    console.log("Total stock for variants:", totalVariantStock); // Debugging line
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated successfully`,
      });
      setEditingProduct(null);
    } else {
      addProduct(formData);
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
    console.log(`Checking stock status for product: ${product.name}`); // Debugging line
    const totalStock = product.variants && product.variants.length > 0
        ? product.variants.reduce((total, variant) => {
            console.log(`Variant: ${variant.size}, Stock: ${variant.stock}`); // Debugging line
            return total + variant.stock;
        }, 0) 
        : product.stock;

    console.log(`Total Stock for ${product.name}: ${totalStock}`); // Debugging line
    console.log(`Product Variants:`, product.variants); // Debugging line
    
    if (isOutOfStock(product)) {
      return { status: 'Out of Stock', color: 'destructive' as const, icon: AlertTriangle };
    } else if (isLowStock(product)) {
      return { status: 'Low Stock', color: 'warning' as const, icon: AlertTriangle };
    }
    return { status: 'In Stock', color: 'secondary' as const, icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Product Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Manage your store inventory and product catalog
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="pos-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
              
              {!formData.hasVariants && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Selling Price (₱) *</Label>
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
                    <Label htmlFor="stock">Initial Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              )}

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
                <Label htmlFor="hasVariants">Has Size Variants</Label>
              </div>

              {formData.hasVariants && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    
                    <div className="flex items-center justify-between">
                      <Label id="sizeVariants" className="text-sm font-medium">Size Variants</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVariant = {
                            id: generateUUID(),
                            size: '',
                            price: formData.price,
                            stock: 0,
                            isActive: true
                          };
                          setFormData({...formData, variants: [...formData.variants, newVariant]});
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Size
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Size</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Price</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Stock</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Barcode</label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Action</label>
                    </div>
                  </div>
                  {formData.variants.map((variant, index) => (
                    <div key={variant.id} className="grid grid-cols-5 gap-2 items-center">
                      <Input
                        placeholder="Size (e.g., S, M, L)"
                        value={variant.size}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {...newVariants[index], size: e.target.value};
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="col-span-1"
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {...newVariants[index], price: parseFloat(e.target.value) || 0};
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="col-span-1"
                        min={0.01}
                        step={0.01}
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {...newVariants[index], stock: parseInt(e.target.value) || 0};
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="col-span-1"
                        min={0}
                      />
                      <Input
                        placeholder="Barcode"
                        value={variant.barcode || ''}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = {...newVariants[index], barcode: e.target.value};
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="col-span-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVariants = formData.variants.filter((_, i) => i !== index);
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="col-span-1"
                        aria-label={`Remove size variant ${variant.size || index + 1}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  </div>
                  </div>
                )}
 
               <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setEditingProduct(null);
                  resetForm();
                }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 pos-button-primary">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="pos-card-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              placeholder="Search products by name, category, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                    <TableHead>Variant Prices</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.barcode && (
                          <div className="text-sm text-[hsl(var(--muted-foreground))]">
                            {product.barcode}
                          </div>
                        )}
                        {product.hasVariants && (
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            {product.variants?.length || 0} variants
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {product.variants
                        ? formatPeso(Math.min(...product.variants.map(variant => variant.price)))
                        : formatPeso(product.price)}
                    </TableCell>
                    <TableCell>
                      {product.variants
                        ? product.variants.reduce((total, variant) => total + variant.stock, 0)
                        : product.stock}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={stockStatus.color === 'warning' ? 'secondary' : stockStatus.color === 'destructive' ? 'destructive' : 'secondary'}
                        className={stockStatus.color === 'warning' ? 'low-stock' : stockStatus.color === 'destructive' ? 'out-of-stock' : ''}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {stockStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(product);
            setShowAddDialog(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product)}
                          className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
