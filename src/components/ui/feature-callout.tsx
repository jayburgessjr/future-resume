import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";

interface FeatureCalloutProps {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'tip' | 'feature' | 'upgrade';
  dismissible?: boolean;
  children?: React.ReactNode;
}

export const FeatureCallout = ({
  id,
  title,
  description,
  action,
  variant = 'tip',
  dismissible = true,
  children
}: FeatureCalloutProps) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(`callout_dismissed_${id}`) === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem(`callout_dismissed_${id}`, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'feature':
        return {
          icon: Zap,
          bgClass: 'bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20',
          iconColor: 'text-accent',
          badgeText: 'Feature Spotlight'
        };
      case 'upgrade':
        return {
          icon: TrendingUp,
          bgClass: 'bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20',
          iconColor: 'text-primary',
          badgeText: 'Pro Tip'
        };
      default:
        return {
          icon: Sparkles,
          bgClass: 'bg-gradient-to-br from-muted/50 to-background border-border/50',
          iconColor: 'text-muted-foreground',
          badgeText: 'Tip'
        };
    }
  };

  const { icon: Icon, bgClass, iconColor, badgeText } = getVariantStyles();

  return (
    <Card className={`${bgClass} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full bg-background/50 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {badgeText}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-foreground">
                  {title}
                </h4>
              </div>
              
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-background/80 opacity-50 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
            
            {children && (
              <div className="mt-3">
                {children}
              </div>
            )}
            
            {action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={action.onClick}
                  className="text-xs h-7"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};