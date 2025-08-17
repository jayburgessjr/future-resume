import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Settings } from "lucide-react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

export const SubscriptionBadge = () => {
  const { subscribed, subscriptionTier, openCustomerPortal, loading } = useSubscriptionStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (subscribed && subscriptionTier) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="flex items-center gap-1 bg-accent text-accent-foreground">
          <Crown className="h-3 w-3" />
          {subscriptionTier}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={openCustomerPortal}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="accent"
        size="sm"
        onClick={() => setShowUpgradeModal(true)}
        className="flex items-center gap-1"
      >
        <Crown className="h-3 w-3" />
        Upgrade
      </Button>
      
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </>
  );
};