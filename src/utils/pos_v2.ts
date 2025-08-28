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

// Local storage utilities
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
export const generateReceiptText = (sale: Sale, businessSettings: any): string => {
  const { net, vat } = calculateVATExclusive(sale.total);
  
  let receipt = '';
  receipt += `${businessSettings.businessName.padStart((RECEIPT_WIDTH + businessSettings.businessName.length) / 2)}\n`;
  receipt += `${businessSettings.address.padStart((RECEIPT_WIDTH + businessSettings.address.length) / 2)}\n`;
  receipt += `TIN: ${businessSettings.tin.padStart((RECEIPT_WIDTH + businessSettings.tin.length) / 2)}\n`;
  receipt += `BIR Permit: ${businessSettings.birPermitNumber.padStart((RECEIPT_WIDTH + businessSettings.birPermitNumber.length) / 2)}\n`;
  receipt += `Contact: ${businessSettings.contactNumber.padStart((RECEIPT_WIDTH + businessSettings.contactNumber.length) / 2)}\n`;
  receipt += `\n`;
  receipt += `Receipt #: ${sale.receiptNumber}\n`;
  receipt += `Date: ${formatPhilippineDateTime(new Date(sale.timestamp))}\n`;
  receipt += `Cashier: ${sale.cashierName}\n`;
  receipt += `\n`;
  receipt += `${'='.repeat(40)}\n`;
  receipt += `ITEMS\n`;
  receipt += `${'='.repeat(40)}\n`;
  
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
  receipt += `${'-'.repeat(40)}\n`;
  receipt += `Subtotal:${formatPeso(sale.subtotal).padStart(30)}\n`;
  
  if (sale.discount > 0) {
    receipt += `Discount:${formatPeso(sale.discount).padStart(30)}\n`;
  }
  
  receipt += `VAT (12%):${formatPeso(vat).padStart(29)}\n`;
  receipt += `${'='.repeat(40)}\n`;
  receipt += `TOTAL:${formatPeso(sale.total).padStart(33)}\n`;
  receipt += `${'='.repeat(40)}\n`;
  receipt += `\n`;
  receipt += `Payment: ${sale.paymentMethod.toUpperCase()}\n`;
  if (sale.paymentMethod === 'gcash' && sale.referenceNumber) {
    receipt += `Reference: ${sale.referenceNumber}\n`;
  }
  receipt += `Amount Received: ${formatPeso(sale.amountReceived)}\n`;
  receipt += `Change: ${formatPeso(sale.change)}\n`;
  receipt += `\n`;
  receipt += `${' '.repeat((RECEIPT_WIDTH - businessSettings.receiptFooter.length) / 2)}${businessSettings.receiptFooter}\n`;
  receipt += `\n`;
  receipt += `${' '.repeat((RECEIPT_WIDTH - 'Thank you for your business!'.length) / 2)}Thank you for your business!\n`;
  
  return receipt;
};
