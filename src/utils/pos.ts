import { CartItem, Sale, Product, PHILIPPINES_VAT_RATE, PESO_SYMBOL } from '@/types/pos';

// Receipt settings
export const RECEIPT_WIDTH = 80; // characters

// Currency formatting for Philippines Peso
export const formatPeso = (amount: number): string => {
  return `${PESO_SYMBOL}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// VAT calculations
export const calculateVAT = (amount: number): number => {
  return amount * PHILIPPINES_VAT_RATE;
};

export const calculateVATExclusive = (totalWithVAT: number): { net: number; vat: number } => {
  const net = totalWithVAT / (1 + PHILIPPINES_VAT_RATE);
  const vat = totalWithVAT - net;
  return { net, vat };
};

export const calculateSubtotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + item.subtotal, 0);
};

export const calculateDiscount = (subtotal: number, discount: number, discountType: 'percentage' | 'fixed'): number => {
  if (discountType === 'percentage') {
    return (subtotal * discount) / 100;
  }
  return discount;
};

export const calculateTotal = (subtotal: number, discountAmount: number): number => {
  return subtotal - discountAmount; // Assuming no VAT for now
};

export const isLowStock = (product: Product): boolean => {
  if (product.variants && product.variants.length > 0) {
    // For products with variants, check if ANY variant is low stock
    return product.variants.some(variant => variant.stock <= 10 && variant.stock > 0);
  }
  return product.stock <= 10 && product.stock > 0;
};

export const isOutOfStock = (product: Product): boolean => {
  if (product.variants && product.variants.length > 0) {
    // For products with variants, check if ANY variant is in stock
    return !product.variants.some(variant => variant.stock > 0);
  }
  return product.stock <= 0;
};
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage:`, error);
    return defaultValue;
  }
};

// Generate a unique receipt number
export const generateReceiptNumber = (): string => {
  return `R-${Date.now()}`;
};

// Date formatting for Philippines
export const formatPhilippineDate = (date: Date): string => {
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPhilippineDateTime = (date: Date): string => {
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Receipt generation
// Get top selling products by revenue
export const getTopSellingProducts = (sales: Sale[], limit: number = 5): Array<{product: string; quantity: number; revenue: number}> => {
  const productSales: Record<string, {quantity: number; revenue: number}> = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const productName = item.product.name;
      if (!productSales[productName]) {
        productSales[productName] = { quantity: 0, revenue: 0 };
      }
      productSales[productName].quantity += item.quantity;
      productSales[productName].revenue += item.subtotal;
    });
  });
  
  return Object.entries(productSales)
    .map(([product, data]) => ({
      product,
      quantity: data.quantity,
      revenue: data.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

export const generateReceiptText = (sale: Sale, businessSettings: any): string => {
  const { net, vat } = calculateVATExclusive(sale.total);
  
  let receipt = '';
  const receiptWidth = businessSettings.receiptWidth || RECEIPT_WIDTH;
  
  // Custom header
  if (businessSettings.receiptHeader) {
    receipt += `${businessSettings.receiptHeader.padStart((receiptWidth + businessSettings.receiptHeader.length) / 2)}\n\n`;
  }
  
  // Business information with conditional display
  if (businessSettings.showBusinessName !== false) {
    receipt += `${businessSettings.businessName.padStart((receiptWidth + businessSettings.businessName.length) / 2)}\n`;
  }
  if (businessSettings.showAddress !== false) {
    receipt += `${businessSettings.address.padStart((receiptWidth + businessSettings.address.length) / 2)}\n`;
  }
  if (businessSettings.showTIN !== false) {
    receipt += `TIN: ${businessSettings.tin.padStart((receiptWidth + businessSettings.tin.length) / 2)}\n`;
  }
  if (businessSettings.showBIRPermit !== false) {
    receipt += `BIR Permit: ${businessSettings.birPermitNumber.padStart((receiptWidth + businessSettings.birPermitNumber.length) / 2)}\n`;
  }
  if (businessSettings.showContactNumber !== false) {
    receipt += `Contact: ${businessSettings.contactNumber.padStart((receiptWidth + businessSettings.contactNumber.length) / 2)}\n`;
  }
  receipt += `\n`;
  receipt += `Receipt #: ${sale.receiptNumber}\n`;
  receipt += `Date: ${formatPhilippineDateTime(new Date(sale.timestamp))}\n`;
  receipt += `Cashier: ${sale.cashierName}\n`;
  receipt += `\n`;
  receipt += `${'='.repeat(receiptWidth)}\n`;
  receipt += `ITEMS\n`;
  receipt += `${'='.repeat(receiptWidth)}\n`;
  
  sale.items.forEach(item => {
    const variantInfo = item.variant ? ` (${item.variant.size})` : '';
    const itemLine = `${item.product.name}${variantInfo}`;
    const unitPrice = item.variant?.price ?? item.product.price;
    const qtyPrice = `${item.quantity} x ${formatPeso(unitPrice)}`;
    const total = formatPeso(item.subtotal);
    
    receipt += `${itemLine}\n`;
    receipt += `  ${qtyPrice.padEnd(25)} ${total.padStart(10)}\n`;
  });
  
  receipt += `\n`;
  receipt += `${'-'.repeat(receiptWidth)}\n`;
  receipt += `Subtotal:${formatPeso(sale.subtotal).padStart(receiptWidth - 9)}\n`;
  
  if (sale.discount > 0) {
    receipt += `Discount:${formatPeso(sale.discount).padStart(receiptWidth - 9)}\n`;
  }
  
  receipt += `VAT (12%):${formatPeso(vat).padStart(receiptWidth - 10)}\n`;
  receipt += `${'='.repeat(receiptWidth)}\n`;
  receipt += `TOTAL:${formatPeso(sale.total).padStart(receiptWidth - 6)}\n`;
  receipt += `${'='.repeat(receiptWidth)}\n`;
  receipt += `\n`;
  receipt += `Payment: ${sale.paymentMethod.toUpperCase()}\n`;
  if ((sale.paymentMethod === 'gcash' || sale.paymentMethod === 'card') && sale.referenceNumber) {
    receipt += `Reference: ${sale.referenceNumber}\n`;
  }
  receipt += `Amount Received: ${formatPeso(sale.amountReceived)}\n`;
  receipt += `Change: ${formatPeso(sale.change)}\n`;
  receipt += `\n`;
  receipt += `${' '.repeat((receiptWidth - businessSettings.receiptFooter.length) / 2)}${businessSettings.receiptFooter}\n`;
  receipt += `\n`;
  receipt += `${' '.repeat((receiptWidth - 'Thank you for your business!'.length) / 2)}Thank you for your business!\n`;
  
  return receipt;
};
