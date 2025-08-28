import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { Sale } from '@/types/pos';
import { formatPeso } from '@/utils/pos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReceiptModalProps {
  sale: Sale | null;
  businessSettings: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReceiptModal = ({ sale, businessSettings, open, onOpenChange }: ReceiptModalProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  if (!sale) return null;

  const receiptText = `
 
  ${businessSettings.businessName}
  ${businessSettings.address}
  TIN: ${businessSettings.tin}
  BIR Permit: ${businessSettings.birPermit}
  Contact: ${businessSettings.contact}
  
  Receipt #: ${sale.receiptNumber}
  Date: ${new Date(sale.timestamp).toLocaleString()}
  Cashier: ${sale.cashierName}

  ===============================
  ITEMS
  ===============================
  ${sale.items.map(item => `${item.product.name}  ${item.quantity} x ${formatPeso(item.product.price)}`).join('\n')}
  
  -------------------------------
  Subtotal: ${formatPeso(sale.subtotal)}
  VAT (12%): ${formatPeso(sale.vatAmount)}
  ===============================
  TOTAL: ${formatPeso(sale.total)}
  
  Payment: ${sale.paymentMethod}
  Amount Received: ${formatPeso(sale.amountReceived)}
  Change: ${formatPeso(sale.change)}
  
  Salamat sa inyong pagbili!
  Thank you for your business!
  `;

  const handlePrint = () => {
    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${sale.receiptNumber}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 20px;
                max-width: 300px;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 1000);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setTimeout(() => {
        setIsPrinting(false);
      }, 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${sale.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-lg font-bold">
              Receipt #{sale.receiptNumber}
              <br />
              Thank you for shopping with us!
              <br />
              {businessSettings.businessName}
              <br />
              {businessSettings.address}
              <br />
              TIN: {businessSettings.tin}
              <br />
              BIR Permit: {businessSettings.birPermit}
              <br />
              Contact: {businessSettings.contact}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Receipt Display */}
          <div className="bg-white border rounded-lg p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {`
                  ===============================
                  ITEMS
                  ===============================
                  ${sale.items.map(item => `${item.product.name}  ${item.quantity} x ${formatPeso(item.product.price)}`).join('\n')}
                  -------------------------------
                  Subtotal: ${formatPeso(sale.subtotal)}
                  VAT (12%): ${formatPeso(sale.vatAmount)}
                  ===============================
                  TOTAL: ${formatPeso(sale.total)}
                  Payment: ${sale.paymentMethod}
                  Amount Received: ${formatPeso(sale.amountReceived)}
                  Change: ${formatPeso(sale.change)}
                  Salamat sa inyong pagbili!
                  Thank you for your business!
                `}
              </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex-1 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? 'Printing...' : 'Print'}
            </Button>
            
            <Button 
              onClick={handleDownload}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Save
            </Button>
          </div>

          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
