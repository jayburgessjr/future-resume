import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Heart, Mail, Calendar, CreditCard, Check } from 'lucide-react';

interface GiftSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GiftSubscriptionModal = ({ open, onOpenChange }: GiftSubscriptionModalProps) => {
  const [step, setStep] = useState(1);
  const [giftData, setGiftData] = useState({
    recipientEmail: '',
    recipientName: '',
    duration: '1',
    personalMessage: '',
    senderName: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const durationOptions = [
    { value: '1', label: '1 Month', price: 20 },
    { value: '3', label: '3 Months', price: 54, savings: 6 },
    { value: '6', label: '6 Months', price: 102, savings: 18 },
    { value: '12', label: '1 Year', price: 192, savings: 48 }
  ];

  const selectedDuration = durationOptions.find(d => d.value === giftData.duration);

  const handleNext = () => {
    if (step === 1) {
      if (!giftData.recipientEmail || !giftData.recipientName) {
        toast({
          title: "Missing Information",
          description: "Please fill in recipient details.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleGift = async () => {
    setLoading(true);
    try {
      // In real implementation, would call Stripe API for gift subscription
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Gift Sent Successfully!",
        description: `${giftData.recipientName} will receive an email with their gift subscription.`,
      });
      
      setStep(4); // Success step
    } catch (error) {
      toast({
        title: "Gift Failed",
        description: "Unable to process gift subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setGiftData({
      recipientEmail: '',
      recipientName: '',
      duration: '1',
      personalMessage: '',
      senderName: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Gift className="h-4 w-4 text-white" />
            </div>
            Gift Resume Builder Pro
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum < step ? 'bg-primary text-white' :
                    stepNum === step ? 'bg-accent text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {stepNum < step ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      stepNum < step ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Who are you gifting to?</h3>
                <p className="text-muted-foreground">Enter your friend's details to send them Resume Builder Pro</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Recipient's Name</Label>
                  <Input
                    id="recipient-name"
                    placeholder="e.g., Sarah Johnson"
                    value={giftData.recipientName}
                    onChange={(e) => setGiftData(prev => ({ ...prev, recipientName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient-email">Recipient's Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    placeholder="sarah@example.com"
                    value={giftData.recipientEmail}
                    onChange={(e) => setGiftData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender-name">Your Name</Label>
                  <Input
                    id="sender-name"
                    placeholder="How should we identify you in the gift message?"
                    value={giftData.senderName}
                    onChange={(e) => setGiftData(prev => ({ ...prev, senderName: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Choose Gift Duration</h3>
                <p className="text-muted-foreground">Select how long you'd like to gift Pro access</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {durationOptions.map((option) => (
                  <Card 
                    key={option.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      giftData.duration === option.value 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setGiftData(prev => ({ ...prev, duration: option.value }))}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{option.label}</h4>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">${option.price}</p>
                          {option.savings && (
                            <Badge className="bg-green-100 text-green-800">
                              Save ${option.savings}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Add Personal Message</h3>
                <p className="text-muted-foreground">Include a personal note with your gift (optional)</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personal-message">Personal Message</Label>
                  <Textarea
                    id="personal-message"
                    placeholder="Hey Sarah! I thought this resume builder might help with your job search. Good luck! 🎉"
                    value={giftData.personalMessage}
                    onChange={(e) => setGiftData(prev => ({ ...prev, personalMessage: e.target.value }))}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {giftData.personalMessage.length}/500 characters
                  </p>
                </div>

                {/* Gift Summary */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Gift Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Recipient:</span>
                        <span className="font-medium">{giftData.recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{giftData.recipientEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{selectedDuration?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-bold text-lg">${selectedDuration?.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Gift Sent Successfully!</h3>
                <p className="text-muted-foreground">
                  {giftData.recipientName} will receive an email with instructions to activate their gift subscription.
                </p>
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Email sent to {giftData.recipientEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Gift tracking ID: GIFT-{Date.now().toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={resetAndClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={step === 1 ? () => onOpenChange(false) : handleBack}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            {step === 3 ? (
              <Button 
                onClick={handleGift}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {loading ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Gift (${selectedDuration?.price})
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};