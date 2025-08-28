import { Sale, BusinessSettings } from '@/types/pos';
import { generateReceiptText } from './pos';

// Sample sale data for preview
export const sampleSale: Sale = {
  id: 'preview-001',
  receiptNumber: 'RC-2024-0001',
  timestamp: new Date(),
  cashierName: 'John Doe',
  items: [
    {
      productId: 'prod-001',
      product: {
        id: 'prod-001',
        name: 'Coca-Cola 1.5L',
        price: 75,
        stock: 50,
        category: 'Beverages',
        barcode: '4900000001',
        hasVariants: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      quantity: 2,
      subtotal: 150
    },
    {
      productId: 'prod-002',
      product: {
        id: 'prod-002',
        name: 'Lays Classic Chips',
        price: 45,
        stock: 30,
        category: 'Snacks',
        barcode: '4900000002',
        hasVariants: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      quantity: 1,
      subtotal: 45
    }
  ],
  subtotal: 195,
  discount: 0,
  discountType: 'fixed',
  vatAmount: 0,
  total: 195,
  paymentMethod: 'cash',
  amountReceived: 200,
  change: 5,
  cashierId: 'cashier-001'
};

// Different settings configurations for preview
export const defaultSettings: BusinessSettings = {
  businessName: 'BALANDZXC POS',
  address: '123 Barangay Street, Gabao, Irosin',
  tin: '123-456-789-000',
  birPermitNumber: 'FP-12345678',
  contactNumber: '+63 912 345 6789',
  email: 'store@example.com',
  receiptFooter: 'Salamat sa inyong pagbili!',
  vatEnabled: true,
  vatRate: 0.12,
  receiptHeader: 'Thank you for shopping with us!',
  receiptFontSize: 12,
  receiptWidth: 80,
  showBusinessName: true,
  showAddress: true,
  showTIN: true,
  showBIRPermit: true,
  showContactNumber: true
};

export const minimalSettings: BusinessSettings = {
  ...defaultSettings,
  receiptHeader: '',
  showBusinessName: false,
  showAddress: false,
  showTIN: false,
  showBIRPermit: false,
  showContactNumber: false,
  receiptWidth: 60
};

export const wideSettings: BusinessSettings = {
  ...defaultSettings,
  receiptHeader: 'WELCOME TO OUR STORE!',
  receiptWidth: 100,
  showBusinessName: true,
  showAddress: true,
  showTIN: false,
  showBIRPermit: false,
  showContactNumber: true
};

// Generate preview receipts
export const generatePreviewReceipts = () => {
  const defaultReceipt = generateReceiptText(sampleSale, defaultSettings);
  const minimalReceipt = generateReceiptText(sampleSale, minimalSettings);
  const wideReceipt = generateReceiptText(sampleSale, wideSettings);
  
  return {
    default: defaultReceipt,
    minimal: minimalReceipt,
    wide: wideReceipt
  };
};

// Function to display receipt preview in console
export const displayReceiptPreview = () => {
  const previews = generatePreviewReceipts();
  
  console.log('=== DEFAULT RECEIPT SETTINGS ===');
  console.log(previews.default);
  console.log('\n=== MINIMAL RECEIPT SETTINGS ===');
  console.log(previews.minimal);
  console.log('\n=== WIDE RECEIPT SETTINGS ===');
  console.log(previews.wide);
  
  return previews;
};
