import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { nextAfterPricing } from "@/lib/flowRouter";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Check, 
  Star, 
  Zap, 
  Users,
  Download,
  History,
  Crown
} from "lucide-react";

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState("");

  // Redirect if not signed in
  useEffect(() => {
    if (!user) {
      navigate("/auth/sign-in");
    }
  }, [user, navigate]);

  const handlePlanSelect = async (plan: 'free' | 'pro') => {
    if (!user) return;
    
    setLoading(plan);

    try {
      // Update user's plan in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan,
          onboarding_status: 'complete' 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      if (plan === 'free') {
        toast({
          title: "Welcome to the free plan!",
          description: "You can start building your first resume right away.",
        });
        navigate(nextAfterPricing({ plan }));
      } else {
        // For Pro plan - this would integrate with Stripe in the future
        toast({
          title: "Pro plan coming soon!",
          description: "Pro features are being finalized. Starting with free plan for now.",
        });
        
        // For now, treat Pro selection as Free
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('user_id', user.id);
          
        navigate(nextAfterPricing({ plan: 'free' }));
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading("");
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/auth/sign-in" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm text-green-600">Account</span>
            </div>
            <div className="w-8 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm font-medium text-primary">Plan</span>
            </div>
            <div className="w-8 h-0.5 bg-muted"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-sm">3</span>
              </div>
              <span className="ml-2 text-sm text-muted-foreground">Dashboard</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you need more features. 
            Both plans include our AI-powered resume optimization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Free</CardTitle>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-muted-foreground">Perfect to get started</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">1 resume generation</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">AI-powered optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">ATS compatibility check</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Basic export options</span>
                </li>
              </ul>

              <Button 
                onClick={() => handlePlanSelect('free')}
                disabled={loading === 'free'}
                className="w-full"
                variant="outline"
              >
                {loading === 'free' ? "Setting up..." : "Start Free"}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary/50 hover:shadow-lg transition-shadow">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white">
              Coming Soon
            </Badge>
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <div className="text-3xl font-bold">$20<span className="text-base font-normal text-muted-foreground">/month</span></div>
              <p className="text-muted-foreground">For serious job seekers</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Unlimited resumes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Advanced AI optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Interview toolkit</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Version history</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Premium export formats</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>

              <Button 
                onClick={() => handlePlanSelect('pro')}
                disabled={loading === 'pro'}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading === 'pro' ? "Setting up..." : "Choose Pro"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            You can upgrade or downgrade your plan at any time
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;