import { ReactNode, useState } from "react";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { UpgradeModal } from "./UpgradeModal";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface FeatureGuardProps {
  feature: 'version_history' | 'exports' | 'interview_toolkit' | 'unlimited_resumes';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
  featureName?: string;
}

export const FeatureGuard = ({ 
  feature, 
  children, 
  fallback, 
  showUpgradeButton = true,
  featureName 
}: FeatureGuardProps) => {
  const { canAccessFeature } = useSubscriptionStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const hasAccess = canAccessFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getFeatureDisplayName = () => {
    if (featureName) return featureName;
    
    switch (feature) {
      case 'version_history': return 'Version History';
      case 'exports': return 'Export Features';
      case 'interview_toolkit': return 'Interview Toolkit';
      case 'unlimited_resumes': return 'Unlimited Resumes';
      default: return 'This Feature';
    }
  };

  return (
    <>
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        
        {showUpgradeButton && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <Button
              variant="accent"
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Unlock {getFeatureDisplayName()}
            </Button>
          </div>
        )}
      </div>
      
      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        feature={getFeatureDisplayName()}
      />
    </>
  );
};