import { useState } from 'react';
import { ReceiptModal } from './ReceiptModal';
import { Sale } from '@/types/pos';

interface SaleCompletionHandlerProps {
  onSaleComplete: (sale: Sale) => void;
  businessSettings: any;
}

export const SaleCompletionHandler = ({ onSaleComplete, businessSettings }: SaleCompletionHandlerProps) => {
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleSaleComplete = (sale: Sale) => {
    setCompletedSale(sale);
    setShowReceipt(true);
    onSaleComplete(sale);
  };

  return {
    handleSaleComplete,
    receiptModal: (
      <ReceiptModal
        sale={completedSale}
        businessSettings={businessSettings}
        open={showReceipt}
        onOpenChange={setShowReceipt}
      />
    )
  };
};
