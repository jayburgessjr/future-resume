/**
 * Pure functions for determining user flow redirects
 * Keep all routing logic centralized and testable
 */

interface UserContext {
  returnTo?: string | null;
  hasProfile?: boolean;
  hasPlan?: boolean;
  plan?: string | null;
  onboardingStatus?: string | null;
  hasActiveFlow?: boolean;
}

/**
 * Determine where to redirect after successful sign in
 */
export function nextAfterSignIn(ctx: UserContext): string {
  // Honor returnTo parameter if present
  if (ctx.returnTo) {
    return ctx.returnTo;
  }
  
  // Default to dashboard for existing users
  return '/dashboard';
}

/**
 * Determine where to redirect after successful sign up
 */
export function nextAfterSignUp(ctx: UserContext = {}): string {
  // New users always go to pricing first
  return '/pricing';
}

/**
 * Determine where to redirect after pricing selection
 */
export function nextAfterPricing(ctx: UserContext): string {
  // After selecting plan, go to dashboard
  return '/dashboard';
}

/**
 * Determine where to redirect from dashboard
 */
export function nextFromDashboard(ctx: UserContext): string {
  // Always go to builder - it will determine the right step
  return '/builder';
}

/**
 * Check if user needs onboarding
 */
export function needsOnboarding(ctx: UserContext): boolean {
  return !ctx.hasPlan || ctx.onboardingStatus === 'new';
}

/**
 * Get the appropriate landing route for authenticated users
 */
export function getAuthenticatedLanding(ctx: UserContext): string {
  if (needsOnboarding(ctx)) {
    return '/pricing';
  }
  return '/dashboard';
}

/**
 * ReturnTo parameter management
 */
export const returnTo = {
  set: (url: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('returnTo', url);
    }
  },
  
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('returnTo');
    }
    return null;
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('returnTo');
    }
  }
};