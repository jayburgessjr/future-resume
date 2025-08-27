import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Settings, Sparkles, Calendar, Clock, Heart } from "lucide-react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useState, useEffect } from "react";
import { UpgradeModal } from "./UpgradeModal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const SubscriptionBadge = () => {
  const { subscribed, subscriptionTier, subscriptionEnd, openCustomerPortal, loading, getTrialDaysRemaining } = useSubscriptionStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const trialDaysLeft = getTrialDaysRemaining();

  if (subscribed && subscriptionTier) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-accent text-white border-0 hover:opacity-90 transition-all duration-200 cursor-help shadow-md hover:shadow-lg px-3 py-1.5">
              <Crown className="h-3 w-3" />
              <span className="font-medium">{subscriptionTier} Member</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">Active Pro Subscription</p>
              {subscriptionEnd && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews {new Date(subscriptionEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="sm"
          onClick={openCustomerPortal}
          disabled={loading}
          className="h-8 w-8 p-0 hover:bg-accent/10 transition-colors duration-200"
          aria-label="Manage billing and subscription"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 flex items-center gap-1.5 hover:opacity-90 transition-all duration-200 cursor-help shadow-md hover:shadow-lg px-3 py-1.5">
            {trialDaysLeft !== null ? (
              <Clock className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span className="font-medium">
              {trialDaysLeft !== null ? `${trialDaysLeft} Days Left` : 'Free Trial'}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">Free Trial Active</p>
            {trialDaysLeft !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                {trialDaysLeft > 0 
                  ? `${trialDaysLeft} days remaining`
                  : 'Trial expired - upgrade to continue'
                }
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowUpgradeModal(true)}
        className="flex items-center gap-1.5 hover:bg-accent/10 border-accent/30 text-accent hover:text-accent-foreground transition-all duration-200 hover:scale-105"
        aria-label="Upgrade to Pro subscription"
      >
        <Crown className="h-3 w-3" />
        <span className="hidden sm:inline">Upgrade to Pro</span>
        <span className="sm:hidden">Pro</span>
      </Button>
      
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </>
  );
};