import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export const UpgradeModal = ({ open, onOpenChange, feature }: UpgradeModalProps) => {
  const { createCheckout, loading } = useSubscriptionStore();

  const handleUpgrade = async () => {
    await createCheckout();
    onOpenChange(false);
  };

  const freeFeatures = [
    "1 resume",
    "Basic templates",
    "PDF download"
  ];

  const proFeatures = [
    "Unlimited resumes",
    "Version history & drafts",
    "Interview toolkit",
    "All export formats (.txt, .md, PDF)",
    "Company signal tracking",
    "Priority support"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl"
        aria-describedby="upgrade-modal-description"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {feature ? `Unlock ${feature}` : "Upgrade to Pro"}
          </DialogTitle>
          <p id="upgrade-modal-description" className="sr-only">
            Compare Free and Pro plan features to upgrade your account
          </p>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 py-6">
          {/* Free Plan */}
          <div className="relative rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="text-sm text-muted-foreground">Get started</p>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-xl border-2 border-accent p-6 bg-gradient-to-br from-accent/5 to-primary/5">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
              Most Popular
            </Badge>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Crown className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pro</h3>
                <p className="text-sm text-muted-foreground">Everything you need</p>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-3xl font-bold">$20</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              onClick={handleUpgrade}
              disabled={loading}
              variant="accent"
              className="w-full"
              size="lg"
              aria-label="Upgrade to Pro plan for $20 per month"
            >
              {loading ? "Processing..." : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>30-day money-back guarantee • Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};