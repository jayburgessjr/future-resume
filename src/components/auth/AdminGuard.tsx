import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { checkIsAdmin } from '@/services/admin';
import { useToast } from '@/hooks/use-toast';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          toast({
            title: "Access Denied",
            description: "Admin privileges required to access this page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setIsAdmin(false);
        toast({
          title: "Error",
          description: "Failed to verify admin privileges.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};