import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { UsageTracker } from '@/lib/usageTracking';

interface SubscriptionState {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
  checkSubscription: () => Promise<void>;
  clearSubscription: () => void;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  canAccessFeature: (feature: 'version_history' | 'exports' | 'interview_toolkit' | 'unlimited_resumes') => boolean;
  getResumeLimit: () => number;
  getMonthlyGenerationLimit: () => number;
  hasReachedMonthlyLimit: () => boolean;
  getTrialDaysRemaining: () => number | null;
  isTrialExpired: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscribed: false,
  subscriptionTier: null,
  subscriptionEnd: null,
  loading: false,
  error: null,

  checkSubscription: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      set({
        subscribed: data.subscribed || false,
        subscriptionTier: data.subscription_tier,
        subscriptionEnd: data.subscription_end,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to check subscription',
        loading: false 
      });
    }
  },

  clearSubscription: () => {
    set({
      subscribed: false,
      subscriptionTier: null,
      subscriptionEnd: null,
      loading: false,
      error: null
    });
  },

  createCheckout: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      // Open Stripe checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      set({ loading: false });
    } catch (error) {
      console.error('Error creating checkout:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create checkout',
        loading: false 
      });
    }
  },

  openCustomerPortal: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      set({ loading: false });
    } catch (error) {
      console.error('Error opening customer portal:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to open customer portal',
        loading: false 
      });
    }
  },

  canAccessFeature: (feature) => {
    const { subscribed } = get();
    
    switch (feature) {
      case 'unlimited_resumes':
      case 'version_history':
        return subscribed; // Pro only features
      case 'exports':
        return true; // Allow basic PDF export for free users (with watermark)
      case 'interview_toolkit':
        return true; // Allow preview access to interview toolkit
      default:
        return false;
    }
  },

  getResumeLimit: () => {
    const { subscribed } = get();
    return subscribed ? Infinity : 5; // Increased from 3 to 5 resumes for free tier
  },

  getMonthlyGenerationLimit: () => {
    const { subscribed } = get();
    return subscribed ? Infinity : 3; // 3 generations per month for free users
  },

  hasReachedMonthlyLimit: () => {
    const { subscribed } = get();
    if (subscribed) return false;
    
    return UsageTracker.hasReachedLimit('resumeGenerations', get().getMonthlyGenerationLimit());
  },

  getTrialDaysRemaining: () => {
    const { subscribed, subscriptionEnd } = get();
    if (subscribed || !subscriptionEnd) return null;
    
    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  },

  isTrialExpired: () => {
    const { subscribed, subscriptionEnd } = get();
    if (subscribed || !subscriptionEnd) return false;
    
    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    return now > endDate;
  },

  // Helper to get subscription status for display
  getSubscriptionStatus: () => {
    const { subscribed, subscriptionTier } = get();
    const trialDays = get().getTrialDaysRemaining();
    const isExpired = get().isTrialExpired();
    
    if (subscribed && subscriptionTier) {
      return {
        type: 'pro' as const,
        label: `${subscriptionTier} Member`,
        color: 'primary',
        urgent: false
      };
    }
    
    if (isExpired) {
      return {
        type: 'expired' as const,
        label: 'Trial Expired',
        color: 'destructive',
        urgent: true
      };
    }
    
    if (trialDays !== null) {
      return {
        type: 'trial' as const,
        label: trialDays > 0 ? `${trialDays} Days Left` : 'Trial Ending',
        color: trialDays <= 2 ? 'warning' : 'accent',
        urgent: trialDays <= 2
      };
    }
    
    return {
      type: 'free' as const,
      label: 'Free Trial',
      color: 'accent',
      urgent: false
    };
  }
}));