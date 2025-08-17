/**
 * Entitlements and feature gating for The Best Darn Job Resume Builder
 */

export interface Profile {
  id: string;
  email?: string | null;
  stripe_customer_id?: string | null;
  plan: 'free' | 'pro';
  sub_status?: string | null;
  current_period_end?: string | null;
}

/**
 * Check if user has Pro plan with active subscription
 */
export function isPro(profile?: Profile | null): boolean {
  return !!(
    profile && 
    profile.plan === 'pro' && 
    profile.sub_status !== 'canceled' && 
    profile.sub_status !== 'past_due' &&
    (profile.current_period_end ? new Date(profile.current_period_end) > new Date() : true)
  );
}

/**
 * Check if user can access a specific feature
 */
export function canAccess(feature: string, profile?: Profile | null): boolean {
  switch (feature) {
    case 'unlimited_resumes':
    case 'version_history':
    case 'interview_toolkit':
    case 'export_formats':
    case 'priority_support':
      return isPro(profile);
    
    case 'basic_resume':
    case 'ai_optimization':
    case 'ats_check':
      return true; // Free features
    
    default:
      return false;
  }
}

/**
 * Get feature limits based on plan
 */
export function getFeatureLimits(profile?: Profile | null) {
  const isProUser = isPro(profile);
  
  return {
    maxResumes: isProUser ? Infinity : 1,
    maxToolkits: isProUser ? Infinity : 3,
    hasVersionHistory: isProUser,
    hasInterviewToolkit: isProUser,
    hasAdvancedExports: isProUser,
    hasPrioritySupport: isProUser,
  };
}

/**
 * Get plan display information
 */
export function getPlanInfo(profile?: Profile | null) {
  const isProUser = isPro(profile);
  
  return {
    planName: isProUser ? 'Pro' : 'Free',
    displayName: isProUser ? 'Resume Builder Pro' : 'Free Plan',
    billing: isProUser ? '$20/month' : 'Free',
    isActive: isProUser,
    needsUpgrade: !isProUser,
  };
}