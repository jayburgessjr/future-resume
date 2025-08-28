import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const ONBOARDING_STORAGE_KEY = 'bestdarnresume_onboarding_completed';

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`;
    const completed = localStorage.getItem(userKey) === 'true';
    
    setIsOnboardingCompleted(completed);
    
    // Show onboarding for new users after a short delay
    if (!completed) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const completeOnboarding = () => {
    if (!user) return;
    
    const userKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`;
    localStorage.setItem(userKey, 'true');
    setIsOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const restartOnboarding = () => {
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    isOnboardingCompleted,
    completeOnboarding,
    skipOnboarding,
    restartOnboarding
  };
}