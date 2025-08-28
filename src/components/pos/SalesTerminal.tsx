import { useState } from 'react';
import { ProductManagement, getStockStatus } from './ProductManagement';
import { usePosData } from '@/hooks/usePosData'; // Correct import for usePosData
import { Button } from '@/components/ui/button';

const SalesTerminal = () => {
  const { products, adjustStock } = usePosData(); // Retrieve products and adjustStock function from the context
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, variant) => {
    if (variant.stock <= 0) {
      alert(`Cannot add ${product.name} (${variant.size}) to cart - Out of stock`);
      return;
    }
    
    // Check if item already exists in cart
    const existingItem = cartItems.find(item => 
      item.productId === product.id && item.variantId === variant.id
    );
    
    if (existingItem) {
      if (existingItem.quantity >= variant.stock) {
        alert(`Cannot add more ${product.name} (${variant.size}) - Only ${variant.stock} available`);
        return;
      }
      setCartItems(cartItems.map(item =>
        item.productId === product.id && item.variantId === variant.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: `${product.id}-${variant.id}`,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        size: variant.size,
        price: variant.price,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const checkout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    // Use the adjustStock function from usePosData to properly update stock levels
    cartItems.forEach(item => {
      // For now, we'll use a placeholder user ID since we don't have user management in this component
      const userId = 'cashier-user-id';
      adjustStock(
        item.productId,
        item.quantity,
        'remove',
        'Sale transaction',
        userId,
        item.variantId
      );
      console.log(`Reduced stock for ${item.name} (${item.size}) by ${item.quantity}`);
    });

    // Force a re-render by updating the cart items state
    setCartItems([]);

    alert('Checkout completed successfully! Stock levels updated.');
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-lg font-bold">BENZ POS</h2>
          <p>Welcome back, Store Cashier</p>
        </div>
        <nav className="mt-4">
          <ul>
            <li><Button className="w-full">Dashboard</Button></li>
            <li><Button className="w-full">Sales Terminal</Button></li>
            <li><Button className="w-full">Inventory</Button></li>
            <li><Button className="w-full">Sales History</Button></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold">Sales Terminal</h1>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search products or scan barcode..."
            className="border p-2 w-full"
          />
        </div>
        <div className="mt-4">
          <Button className="mr-2">All Products</Button>
          <Button className="mr-2">Beverages</Button>
          <Button className="mr-2">Snacks</Button>
          <Button className="mr-2">Instant Noodles</Button>
          <Button className="mr-2">Seasonings</Button>
          <Button>Others</Button>
        </div>
        <ProductManagement />
        <div className="mt-4">
          <h2 className="text-lg font-bold">Current Stock</h2>
          <ul>
            {products.map(product => {
              const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
              const hasAvailableVariant = product.variants && product.variants.some(variant => variant.stock > 0);
              console.log(`Total Stock for ${product.name}: ${totalStock}`);
              
              product.variants.forEach(variant => {
                console.log(`Variant: ${variant.size}, Stock: ${variant.stock}`);
              });
              
              const variantStockDisplay = product.variants.map(variant => (
                <li key={variant.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <span>
                      {variant.size}: {variant.stock > 0 ? `${variant.stock} in stock` : "Out of Stock"}
                      {variant.stock === 0 && (
                        <span className="text-red-500 ml-2">(Cannot be sold)</span>
                      )}
                    </span>
                    {variant.stock > 0 && (
                      <Button 
                        size="sm" 
                        onClick={() => addToCart(product, variant)}
                        className="ml-2"
                      >
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </li>
              ));
              
              return (
                <li key={product.id}>
                  {product.name}: {getStockStatus(product).status}
                  <ul>
                    {variantStockDisplay}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </main>

      {/* Cart Summary */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="text-lg font-bold">Cart ({cartItems.length})</h2>
        {cartItems.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <ul className="space-y-2">
            {cartItems.map(item => (
              <li key={item.id} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">Size: {item.size}</div>
                    <div className="text-sm">Quantity: {item.quantity}</div>
                    <div className="text-sm font-medium">₱{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => removeFromCart(item.id)}
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cartItems.length > 0 && (
          <div className="mt-4">
            <div className="font-bold text-lg">
              Total: ₱{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </div>
            <Button className="w-full mt-2">Checkout</Button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default SalesTerminal;
