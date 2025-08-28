import React, { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { Product, Sale, BusinessSettings, StockAdjustment, User, HeldTransaction, CartItem } from '@/types/pos';
import { getFromLocalStorage, saveToLocalStorage, generateReceiptNumber } from '@/utils/pos_v2';
import { generateUUID } from '@/utils/uuid';

// Define the PosDataContextType interface
interface PosDataContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  adjustStock: (productId: string, quantity: number, type: 'add' | 'remove', reason: string, userId: string, variantId?: string) => void;
  addStockAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'timestamp'>) => void;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  settings: BusinessSettings;
  setSettings: React.Dispatch<React.SetStateAction<BusinessSettings>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  heldTransactions: HeldTransaction[];
  setHeldTransactions: React.Dispatch<React.SetStateAction<HeldTransaction[]>>;
  isLoading: boolean;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  recordSale: (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'timestamp'>) => Sale;
  getSalesByDate: (date: Date) => Sale[];
  getTodaySales: () => Sale[];
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  addCategory: (categoryName: string) => boolean;
  updateCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (categoryName: string) => boolean;
  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>) => User;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getUserByUsername: (username: string) => User | undefined;
  holdTransaction: (items: CartItem[], note?: string) => HeldTransaction;
  retrieveHeldTransaction: (id: string) => CartItem[] | undefined;
  getLowStockProducts: (threshold?: number) => Product[];
  getOutOfStockProducts: () => Product[];
  getDailySalesTotal: (date: Date) => number;
  getMonthlyRevenue: (year: number, month: number) => number;
  searchProducts: (query: string) => Product[];
  getProductByBarcode: (barcode: string) => Product | undefined;
}

// Constants
const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'BALANDZXC POS',
  address: '123 Barangay Street, Gabao, Irosin',
  tin: '123-456-789-000',
  birPermitNumber: 'FP-12345678',
  contactNumber: '+63 912 345 6789',
  email: 'store@example.com',
  receiptFooter: 'Salamat sa inyong pagbili!',
  vatEnabled: true,
  vatRate: 0.12,
  showBusinessName: true,
  showAddress: true,
  showTIN: true,
  showBIRPermit: true,
  showContactNumber: true,
};

const DEFAULT_CATEGORIES = [
  'Beverages',
  'Snacks',
  'Instant Noodles',
  'Seasonings',
  'Personal Care',
  'Household',
  'Canned Goods',
  'Dairy',
  'Frozen',
  'Others'
];

// Utility: parse dates from localStorage
const parseProductDates = (products: any[]): Product[] =>
  products.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));

const parseSalesDates = (sales: any[]): Sale[] =>
  sales.map(sale => ({
    ...sale,
    timestamp: new Date(sale.timestamp),
  }));

const PosDataContext = createContext<PosDataContextType | undefined>(undefined);

export const PosDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<string[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProducts = getFromLocalStorage('pos_products', []);
    const savedSales = getFromLocalStorage('pos_sales', []);
    const savedSettings = getFromLocalStorage('pos_settings', DEFAULT_SETTINGS);
    const savedCategories = getFromLocalStorage('pos_categories', DEFAULT_CATEGORIES);
    const savedAdjustments = getFromLocalStorage('pos_stock_adjustments', []);
    const savedUsers = getFromLocalStorage('pos_users', []);
    const savedHeldTransactions = getFromLocalStorage('pos_held_transactions', []);

    console.log('Products in Local Storage:', savedProducts);
    setProducts(parseProductDates(savedProducts));
    setSales(parseSalesDates(savedSales));
    setSettings(savedSettings);
    setCategories(savedCategories);
    setStockAdjustments(savedAdjustments);
    setUsers(savedUsers);
    setHeldTransactions(savedHeldTransactions);
    setIsLoading(false);
  }, []);

  const addStockAdjustment = (adjustment: Omit<StockAdjustment, 'id' | 'timestamp'>): void => {
    const newAdjustment: StockAdjustment = {
      ...adjustment,
      id: generateUUID(),
      timestamp: new Date(),
    };
    const updated = [...stockAdjustments, newAdjustment];
    setStockAdjustments(updated);
    saveToLocalStorage('pos_stock_adjustments', updated);
  };

  const adjustStock = (
    productId: string,
    quantity: number,
    type: 'add' | 'remove',
    reason: string,
    userId: string,
    variantId?: string
  ): void => {
    const product = products.find(p => p.id === productId);
    console.log(`Adjusting stock for product: ${productId}, type: ${type}, quantity: ${quantity}`);
    if (!product) return;

    let updatedProducts: Product[];
    
    if (product.variants && variantId) {
      // Handle variant stock adjustment
      updatedProducts = products.map(p => {
        if (p.id === productId) {
          const updatedVariants = p.variants?.map(variant => {
            if (variant.id === variantId) {
              const newStock = type === 'add' 
                ? variant.stock + quantity 
                : Math.max(0, variant.stock - quantity);
              return { ...variant, stock: newStock };
            }
            return variant;
          }) || [];
          
          const totalStock = updatedVariants.reduce((acc, variant) => acc + variant.stock, 0);
          return { ...p, variants: updatedVariants, stock: totalStock, updatedAt: new Date() };
        }
        return p;
      });
    } else {
      // Handle simple product stock adjustment
      updatedProducts = products.map(p =>
        p.id === productId 
          ? { 
              ...p, 
              stock: type === 'add' 
                ? p.stock + quantity 
                : Math.max(0, p.stock - quantity),
              updatedAt: new Date() 
            } 
          : p
      );
    }

    setProducts(updatedProducts);
    saveToLocalStorage('pos_products', updatedProducts);

    const adjustment: StockAdjustment = {
      id: generateUUID(),
      productId,
      productName: product.name,
      adjustmentType: type,
      quantity,
      reason,
      userId,
      timestamp: new Date(),
    };

    const updatedAdjustments = [...stockAdjustments, adjustment];
    setStockAdjustments(updatedAdjustments);
    saveToLocalStorage('pos_stock_adjustments', updatedAdjustments);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('Adding product:', newProduct);
    const updated = [...products, newProduct];
    console.log('Updated products:', updated);
    setProducts(updated);
    saveToLocalStorage('pos_products', updated);
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>): void => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, ...updates, updatedAt: new Date() } : p
    );
    setProducts(updated);
    saveToLocalStorage('pos_products', updated);
  };

  const deleteProduct = (productId: string): void => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveToLocalStorage('pos_products', updated);
  };

  const recordSale = (saleData: Omit<Sale, 'id' | 'receiptNumber' | 'timestamp'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID?.() || Date.now().toString(),
      receiptNumber: generateReceiptNumber(),
      timestamp: new Date(),
    };

    saleData.items.forEach(item => {
      updateProduct(item.productId, {
        stock: Math.max(0, item.product.stock - item.quantity),
      });
    });

    const updated = [...sales, newSale];
    setSales(updated);
    saveToLocalStorage('pos_sales', updated);
    return newSale;
  };

  const getSalesByDate = (date: Date): Sale[] => {
    const target = date.toDateString();
    return sales.filter(sale => new Date(sale.timestamp).toDateString() === target);
  };

  const getTodaySales = (): Sale[] => getSalesByDate(new Date());

  const updateSettings = (newSettings: Partial<BusinessSettings>): void => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveToLocalStorage('pos_settings', updated);
  };

  const addCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed || categories.includes(trimmed)) return false;
    const updated = [...categories, trimmed];
    setCategories(updated);
    saveToLocalStorage('pos_categories', updated);
    return true;
  };

  const updateCategory = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed || categories.includes(trimmed)) return false;
    const updatedCategories = categories.map(cat => cat === oldName ? trimmed : cat);
    const updatedProducts = products.map(p =>
      p.category === oldName ? { ...p, category: trimmed, updatedAt: new Date() } : p
    );
    setCategories(updatedCategories);
    setProducts(updatedProducts);
    saveToLocalStorage('pos_categories', updatedCategories);
    saveToLocalStorage('pos_products', updatedProducts);
    return true;
  };

  const deleteCategory = (categoryName: string): boolean => {
    if (!categories.includes(categoryName)) return false;
    if (products.some(p => p.category === categoryName)) return false;
    const updated = categories.filter(cat => cat !== categoryName);
    setCategories(updated);
    saveToLocalStorage('pos_categories', updated);
    return true;
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>): User => {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID?.() || Date.now().toString(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveToLocalStorage('pos_users', updated);
    return newUser;
  };

  const updateUser = (userId: string, updates: Partial<User>): void => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, ...updates } : u
    );
    setUsers(updated);
    saveToLocalStorage('pos_users', updated);
  };

  const deleteUser = (userId: string): void => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveToLocalStorage('pos_users', updated);
  };

  const getUserByUsername = (username: string): User | undefined =>
    users.find(u => u.username.toLowerCase() === username.toLowerCase());

  const holdTransaction = (items: CartItem[], note?: string): HeldTransaction => {
    const heldTransaction: HeldTransaction = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      items,
      timestamp: new Date(),
      note
    };
    const updated = [...heldTransactions, heldTransaction];
    setHeldTransactions(updated);
    saveToLocalStorage('pos_held_transactions', updated);
    return heldTransaction;
  };

  const retrieveHeldTransaction = (id: string): CartItem[] | undefined => {
    const transaction = heldTransactions.find(t => t.id === id);
    if (transaction) {
      const updated = heldTransactions.filter(t => t.id !== id);
      setHeldTransactions(updated);
      saveToLocalStorage('pos_held_transactions', updated);
      return transaction.items;
    }
    return undefined;
  };

  const getLowStockProducts = (threshold = 10): Product[] => {
    return products.filter(product => {
      if (product.variants && product.variants.length > 0) {
        // Check if any variant is low stock
        return product.variants.some(variant => variant.stock > threshold);
      }
      // Check main product stock for products without variants
      return product.stock > threshold;
    });
  };

  const getOutOfStockProducts = (): Product[] => {
    return products.filter(product => {
      if (product.variants && product.variants.length > 0) {
        // Check if any variant is in stock
        return product.variants.some(variant => variant.stock > 0);
      }
      // Check main product stock for products without variants
      return product.stock > 0;
    });
  };

  const getVariantStockAlerts = () => {
    const alerts = [];
    for (const product of products) {
      if (product.variants && product.variants.length > 0) {
        const lowStockVariants = product.variants.filter(v => v.stock <= 10 && v.stock > 0);
        const outOfStockVariants = product.variants.filter(v => v.stock <= 0);
        
        if (lowStockVariants.length > 0) {
          alerts.push({
            product,
            type: 'low',
            variants: lowStockVariants
          });
        }
        
        if (outOfStockVariants.length > 0) {
          alerts.push({
            product,
            type: 'out',
            variants: outOfStockVariants
          });
        }
      }
    }
    return alerts;
  };

  const getDailySalesTotal = (date: Date): number =>
    getSalesByDate(date).reduce((sum, s) => sum + s.total, 0);

  const getMonthlyRevenue = (year: number, month: number): number =>
    sales.filter(s => {
      const d = new Date(s.timestamp);
      return d.getFullYear() === year && d.getMonth() === month;
    }).reduce((sum, s) => sum + s.total, 0);

  const searchProducts = (query: string): Product[] => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode?.includes(query)
    );
  };

  const getProductByBarcode = (barcode: string): Product | undefined =>
    products.find(p => p.barcode === barcode);

  const contextValue: PosDataContextType = {
    products,
    setProducts,
    adjustStock,
    addStockAdjustment,
    sales,
    setSales,
    settings,
    setSettings,
    categories,
    setCategories,
    users,
    setUsers,
    heldTransactions,
    setHeldTransactions,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    getSalesByDate,
    getTodaySales,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addUser,
    updateUser,
    deleteUser,
    getUserByUsername,
    holdTransaction,
    retrieveHeldTransaction,
    getLowStockProducts,
    getOutOfStockProducts,
    getDailySalesTotal,
    getMonthlyRevenue,
    searchProducts,
    getProductByBarcode,
  };

  return (
    <PosDataContext.Provider value={contextValue}>
      {children}
    </PosDataContext.Provider>
  );
};

export const usePosData = () => {
  const context = useContext(PosDataContext);
  if (context === undefined) {
    throw new Error('usePosData must be used within a PosDataProvider');
  }
  return context;
};
