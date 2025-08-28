import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { UsageTracker } from "@/lib/usageTracking";
import { Zap, Crown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

export const UsageMeter = () => {
  const { subscribed, getMonthlyGenerationLimit } = useSubscriptionStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (subscribed) return null; // Don't show for Pro users

  const limit = getMonthlyGenerationLimit();
  const used = UsageTracker.getCurrentUsage('resumeGenerations');
  const remaining = Math.max(0, limit - used);
  const percentage = (used / limit) * 100;

  const getStatusColor = () => {
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 80) return "text-warning";
    return "text-success";
  };

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-warning";
    return "bg-primary";
  };

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Monthly Usage
            </div>
            <Badge variant="secondary" className="text-xs">
              Free Plan
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Resume Generations</span>
              <span className={getStatusColor()}>
                {used} / {limit}
              </span>
            </div>
            <Progress 
              value={Math.min(percentage, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? (
                <>✨ {remaining} generations remaining this month</>
              ) : (
                <>🚫 Monthly limit reached. Resets in {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getDate() - new Date().getDate()} days</>
              )}
            </p>
          </div>

          {percentage >= 80 && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">
                    {remaining === 0 ? "You've reached your monthly limit!" : "Running low on generations!"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Pro for unlimited resume generations, exports, and more premium features.
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-primary to-accent text-white"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature="Unlimited Generations"
      />
    </>
  );
};