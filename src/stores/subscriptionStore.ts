import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionState {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
  error: string | null;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  canAccessFeature: (feature: 'version_history' | 'exports' | 'interview_toolkit' | 'unlimited_resumes') => boolean;
  getResumeLimit: () => number;
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
      case 'exports':
      case 'interview_toolkit':
        return subscribed;
      default:
        return false;
    }
  },

  getResumeLimit: () => {
    const { subscribed } = get();
    return subscribed ? Infinity : 3; // 3 resumes during free trial
  }
}));