import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canAccess, isPro } from '@/lib/entitlements';
import { UpsellModal } from '@/components/subscription/UpsellModal';

/**
 * Hook for feature gating with upsell modal
 */
export const useFeatureGate = () => {
  const { user } = useAuth();
  const [upsellModal, setUpsellModal] = useState({ open: false, feature: '' });

  const checkAccess = (feature: string, profile?: any) => {
    if (canAccess(feature, profile)) {
      return true;
    }
    
    // Show upsell modal
    setUpsellModal({ open: true, feature });
    return false;
  };

  const FeatureGate = ({ 
    feature, 
    profile, 
    children, 
    fallback 
  }: { 
    feature: string; 
    profile?: any; 
    children: React.ReactNode; 
    fallback?: React.ReactNode;
  }) => {
    if (canAccess(feature, profile)) {
      return <>{children}</>;
    }
    
    return fallback || null;
  };

  return {
    checkAccess,
    FeatureGate,
    UpsellModal: (
      <UpsellModal
        open={upsellModal.open}
        onOpenChange={(open) => setUpsellModal({ ...upsellModal, open })}
        feature={upsellModal.feature}
      />
    ),
  };
};