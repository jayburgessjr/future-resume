import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/stores/appData";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/flow/Stepper";
import { StepResume } from "@/components/flow/StepResume";
import { StepCoverLetter } from "@/components/flow/StepCoverLetter";
import { StepHighlights } from "@/components/flow/StepHighlights";
import { StepInterview } from "@/components/flow/StepInterview";
import { FlowFooter } from "@/components/flow/FlowFooter";
import { ReviewBar } from "@/components/flow/ReviewBar";

type FlowStep = 'resume' | 'cover-letter' | 'highlights' | 'interview';

const steps: FlowStep[] = ['resume', 'cover-letter', 'highlights', 'interview'];

const BuilderFlowPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentStepParam = searchParams.get('step') as FlowStep;
  const [currentStep, setCurrentStep] = useState<FlowStep>(
    currentStepParam && steps.includes(currentStepParam) ? currentStepParam : 'resume'
  );

  const { settings, inputs, outputs, status } = useAppDataStore();

  useEffect(() => {
    // Update URL when step changes
    setSearchParams({ step: currentStep });
  }, [currentStep, setSearchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getCurrentStepIndex = () => steps.indexOf(currentStep);
  
  const canProceed = () => {
    switch (currentStep) {
      case 'resume':
        return !!outputs?.resume && !status.loading;
      case 'cover-letter':
        return !!outputs?.coverLetter && !status.loading;
      case 'highlights':
        return !!outputs?.highlights?.length && !status.loading;
      case 'interview':
        return !!outputs?.toolkit && !status.loading;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'resume':
        return <StepResume />;
      case 'cover-letter':
        return <StepCoverLetter />;
      case 'highlights':
        return <StepHighlights />;
      case 'interview':
        return <StepInterview />;
      default:
        return <StepResume />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Job Toolkit Builder</h1>
              <p className="text-xs text-muted-foreground">Generate Complete Career Package</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <SubscriptionBadge />
                <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
                  <User className="w-3 h-3" />
                  {user.email?.split('@')[0]}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Stepper 
            currentStep={currentStep} 
            steps={steps}
            onStepClick={(step) => setCurrentStep(step as FlowStep)}
          />
        </div>
      </div>

      {/* Settings Review Bar */}
      <ReviewBar settings={settings} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
            <CardContent className="p-0">
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Navigation */}
      <FlowFooter
        currentStep={currentStep}
        currentStepIndex={getCurrentStepIndex()}
        totalSteps={steps.length}
        canProceed={canProceed()}
        onNext={handleNext}
        onBack={handleBack}
        isLoading={status.loading}
      />
    </div>
  );
};

export default BuilderFlowPage;