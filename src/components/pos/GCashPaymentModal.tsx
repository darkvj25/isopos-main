import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Copy, Check, X } from 'lucide-react';
import { BusinessSettings } from '@/types/pos';
import { toast } from '@/hooks/use-toast';

interface GCashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (referenceNumber: string) => void;
  amount: number;
  settings: BusinessSettings;
}

export const GCashPaymentModal: React.FC<GCashPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  settings
}) => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const generateReferenceNumber = () => {
    // Generate a random 10-digit reference number
    const ref = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setReferenceNumber(ref);
    return ref;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: "Reference number copied",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    if (!referenceNumber.trim()) {
      toast({
        title: "Reference Number Required",
        description: "Please enter or generate a reference number",
        variant: "destructive",
      });
      return;
    }
    onConfirm(referenceNumber);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            GCash Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Amount */}
          <div className="text-center">
            <Label className="text-sm font-medium">Payment Amount</Label>
            <p className="text-2xl font-bold text-[hsl(var(--primary))]">₱{amount.toFixed(2)}</p>
          </div>

          {/* GCash QR Code */}
          {settings.gcashQR && (
            <div className="text-center">
              <Label className="text-sm font-medium mb-2 block">Scan QR Code</Label>
              <div className="bg-white p-4 rounded-lg border">
                <img 
                  src={settings.gcashQR} 
                  alt="GCash QR Code" 
                  className="w-48 h-48 mx-auto object-contain"
                />
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Scan this QR code to pay via GCash
                </p>
              </div>
            </div>
          )}

          {/* Reference Number */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Reference Number</Label>
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const ref = generateReferenceNumber();
                  copyToClipboard(ref);
                }}
                className="whitespace-nowrap"
              >
                Generate
              </Button>
            </div>

            {referenceNumber && (
              <div className="flex items-center justify-between bg-[hsl(var(--muted))] p-2 rounded text-sm">
                <span className="font-mono">{referenceNumber}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(referenceNumber)}
                  className="h-8 w-8 p-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}

            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Enter the reference number from your GCash transaction or generate one
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-[hsl(var(--muted))] p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Payment Instructions:</h4>
            <ol className="text-xs text-[hsl(var(--muted-foreground))] space-y-1 list-decimal list-inside">
              <li>Open GCash app on your phone</li>
              <li>Tap "Scan QR" or "Pay Bills"</li>
              <li>{settings.gcashQR ? 'Scan the QR code above' : 'Enter the merchant details'}</li>
              <li>Enter amount: ₱{amount.toFixed(2)}</li>
              <li>Complete the payment</li>
              <li>Enter the reference number shown in GCash</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            <Check className="w-4 h-4 mr-2" />
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
