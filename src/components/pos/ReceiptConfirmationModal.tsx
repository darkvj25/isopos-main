import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReceiptConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

const ReceiptConfirmationModal: React.FC<ReceiptConfirmationModalProps> = ({ isOpen, onClose, onPrint }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Receipt</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Would you like to print the receipt?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onPrint(); onClose(); }} className="pos-button-success">Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptConfirmationModal;
