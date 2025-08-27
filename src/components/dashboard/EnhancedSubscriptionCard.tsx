import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Clock, 
  Settings, 
  Gift, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface EnhancedSubscriptionCardProps {
  onGiftSubscription: () => void;
  onManagePreferences: () => void;
}

export const EnhancedSubscriptionCard = ({ 
  onGiftSubscription, 
  onManagePreferences 
}: EnhancedSubscriptionCardProps) => {
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd,
    openCustomerPortal,
    loading,
    getTrialDaysRemaining,
    isTrialExpired
  } = useSubscriptionStore();
  const { toast } = useToast();

  const trialDaysLeft = getTrialDaysRemaining();
  const isExpired = isTrialExpired();

  // Mock usage data (in real app, would come from API)
  const usageStats = {
    resumesCreated: 3,
    resumeLimit: subscribed ? Infinity : 5,
    exportsUsed: 12,
    exportLimit: subscribed ? Infinity : 15,
    toolkitsGenerated: 2,
    toolkitLimit: subscribed ? Infinity : 3
  };

  const getStatusColor = () => {
    if (subscribed) return 'from-primary to-accent';
    if (isExpired) return 'from-red-500 to-red-600';
    if (trialDaysLeft !== null && trialDaysLeft <= 2) return 'from-orange-500 to-red-500';
    return 'from-orange-500 to-orange-600';
  };

  const getStatusIcon = () => {
    if (subscribed) return Crown;
    if (isExpired) return AlertTriangle;
    return Clock;
  };

  const getStatusText = () => {
    if (subscribed) return `${subscriptionTier} Member`;
    if (isExpired) return 'Trial Expired';
    if (trialDaysLeft !== null) return `${trialDaysLeft} Days Left`;
    return 'Free Trial';
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Subscription Status</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onManagePreferences}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r ${getStatusColor()} text-white shadow-lg`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-semibold text-lg">{getStatusText()}</span>
          </div>
          
          {subscriptionEnd && subscribed && (
            <p className="text-sm text-muted-foreground mt-2">
              Renews {new Date(subscriptionEnd).toLocaleDateString()}
            </p>
          )}
          
          {trialDaysLeft !== null && !subscribed && (
            <div className="mt-3">
              <Progress 
                value={(7 - trialDaysLeft) / 7 * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Trial Progress: Day {7 - trialDaysLeft} of 7
              </p>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Usage This Month</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Resumes Created</span>
              <Badge variant="outline" className="text-xs">
                {usageStats.resumesCreated}/{subscribed ? '∞' : usageStats.resumeLimit}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Exports Used</span>
              <Badge variant="outline" className="text-xs">
                {usageStats.exportsUsed}/{subscribed ? '∞' : usageStats.exportLimit}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Toolkits Generated</span>
              <Badge variant="outline" className="text-xs">
                {usageStats.toolkitsGenerated}/{subscribed ? '∞' : usageStats.toolkitLimit}
              </Badge>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Your Plan Features</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-muted'}`}></div>
              <span className={subscribed ? 'text-foreground' : 'text-muted-foreground'}>
                Unlimited Resumes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-muted'}`}></div>
              <span className={subscribed ? 'text-foreground' : 'text-muted-foreground'}>
                Version History
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-muted'}`}></div>
              <span className={subscribed ? 'text-foreground' : 'text-muted-foreground'}>
                Interview Toolkit
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-muted'}`}></div>
              <span className={subscribed ? 'text-foreground' : 'text-muted-foreground'}>
                Priority Support
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {subscribed ? (
            <>
              <Button
                onClick={openCustomerPortal}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
              <Button
                onClick={onGiftSubscription}
                variant="secondary"
                className="w-full"
              >
                <Gift className="h-4 w-4 mr-2" />
                Gift Pro to Friend
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => window.open('/pricing', '_self')}
                className="w-full bg-gradient-to-r from-primary to-accent text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                {isExpired ? 'Reactivate Pro' : 'Upgrade to Pro'}
              </Button>
              <Button
                onClick={onGiftSubscription}
                variant="outline"
                className="w-full"
              >
                <Gift className="h-4 w-4 mr-2" />
                Gift Pro to Friend
              </Button>
            </>
          )}
        </div>

        {/* Urgent Actions */}
        {isExpired && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Trial expired - upgrade to continue using Pro features</span>
            </div>
          </div>
        )}
        
        {trialDaysLeft !== null && trialDaysLeft <= 2 && !isExpired && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Trial ending soon - upgrade to keep your Pro features</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};