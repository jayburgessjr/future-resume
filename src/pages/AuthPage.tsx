import { AuthForm } from '@/components/auth/AuthForm';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate('/builder');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-md">
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Create an account to save your resumes and access them from any device.
          </p>
        </div>
      </div>
    </div>
  );
}