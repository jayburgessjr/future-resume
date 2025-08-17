import { Badge } from '@/components/ui/badge';

interface StatBadgeProps {
  status: string | boolean | null;
  type: 'plan' | 'subscription' | 'admin';
}

export const StatBadge = ({ status, type }: StatBadgeProps) => {
  const getVariant = () => {
    switch (type) {
      case 'plan':
        return status === 'pro' ? 'default' : 'secondary';
      case 'subscription':
        return status === 'active' ? 'default' : 'destructive';
      case 'admin':
        return status ? 'default' : 'secondary';
      default:
        return 'secondary';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'plan':
        return status === 'pro' ? 'Pro' : 'Free';
      case 'subscription':
        return status || 'None';
      case 'admin':
        return status ? 'Admin' : 'User';
      default:
        return status || 'N/A';
    }
  };

  return (
    <Badge variant={getVariant()} className="text-xs">
      {getLabel()}
    </Badge>
  );
};