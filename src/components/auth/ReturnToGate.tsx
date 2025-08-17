import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { returnTo } from '@/lib/flowRouter';

interface ReturnToGateProps {
  children: React.ReactNode;
}

/**
 * Captures ?returnTo= parameter and stores it for post-auth redirect
 * Should wrap public pages where users might land from external links
 */
export const ReturnToGate = ({ children }: ReturnToGateProps) => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const returnToParam = searchParams.get('returnTo');
    if (returnToParam) {
      // Store the returnTo parameter for use after authentication
      returnTo.set(returnToParam);
    }
  }, [searchParams]);

  return <>{children}</>;
};