import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Check, X, Calendar, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (referenceNumber: string) => void;
  amount: number;
  settings?: any;
}

export const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate card number using Luhn algorithm
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s+/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };

  // Validate expiry date (MM/YY format)
  const validateExpiryDate = (date: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;
    
    const [month, year] = date.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleConfirm = async () => {
    // Validate all fields
    if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !cardHolder.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    if (!validateCardNumber(cardNumber)) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number",
        variant: "destructive",
      });
      return;
    }

    if (!validateExpiryDate(expiryDate)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter a valid expiry date (MM/YY)",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid 3 or 4-digit CVV",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate offline payment processing
    try {
      // In a real offline scenario, this would encrypt and store the payment details
      // For demo purposes, we'll simulate a successful payment after a short delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a reference number (last 4 digits of card + timestamp)
      const lastFourDigits = cardNumber.replace(/\s+/g, '').slice(-4);
      const timestamp = Date.now().toString().slice(-6);
      const referenceNumber = `CARD-${lastFourDigits}-${timestamp}`;
      
      onConfirm(referenceNumber);

      toast({
        title: "Payment Successful",
        description: "Card payment processed successfully",
      });

    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process card payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardHolder('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Card Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Amount */}
          <div className="text-center">
            <Label className="text-sm font-medium">Payment Amount</Label>
            <p className="text-2xl font-bold text-[hsl(var(--primary))]">₱{amount.toFixed(2)}</p>
          </div>

          {/* Card Details Form */}
          <div className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Card Number</Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                disabled={isProcessing}
              />
            </div>

            {/* Card Holder Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Card Holder Name</Label>
              <Input
                placeholder="John Doe"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expiry Date
                </Label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength={5}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  CVV
                </Label>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                  type="password"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-[hsl(var(--muted))] p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Security Notice:</h4>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Your card details are processed securely offline. No payment information is transmitted over the internet.
              For security purposes, card details are encrypted and stored locally.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button onClick={handleClose} variant="outline" disabled={isProcessing}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
