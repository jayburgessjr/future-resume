"use client";
import { useState, useEffect, useRef } from "react";
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
  const runOnce = useRef(false);
  
  const currentStepParam = searchParams.get('step') as FlowStep;
  const [currentStep, setCurrentStep] = useState<FlowStep>(
    currentStepParam && steps.includes(currentStepParam) ? currentStepParam : 'resume'
  );

  const {
    settings,
    inputs,
    outputs,
    flags,
    status,
    loadToolkitIntoBuilder,
    getFirstIncompleteStep,
    getWordCount,
  } = useAppDataStore();

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;

    const p = new URLSearchParams(window.location.search);
    if (!p.get('step')) p.set('step', 'resume');
    if (!p.get('autostart')) p.set('autostart', '1');
    const target = `${window.location.pathname}?${p.toString()}`;
    if (target !== window.location.href) {
      window.history.replaceState({}, '', target);
    }

    const state = useAppDataStore.getState();
    const { resumeText, jobText } = state.inputs;
    const hasOutput = !!state.outputs?.resume?.trim();
    const shouldGenerate =
      p.get('autostart') === '1' &&
      resumeText?.trim() &&
      jobText?.trim() &&
      !hasOutput;

    if (shouldGenerate) {
      state.generateResume();
    }
  }, []);

  useEffect(() => {
    // Handle toolkit loading from URL params
    const toolkitId = searchParams.get('toolkit');
    if (toolkitId) {
      loadToolkitIntoBuilder(toolkitId).then(() => {
        // After loading, determine the appropriate step
        const firstIncompleteStep = getFirstIncompleteStep();
        setCurrentStep(firstIncompleteStep);
        // Clean up URL
        setSearchParams({ step: firstIncompleteStep });
      }).catch((error) => {
        console.error('Error loading toolkit:', error);
        // If loading fails, start from the beginning
        setCurrentStep('resume');
        setSearchParams({ step: 'resume' });
      });
    } else {
      // Normal step handling
      const requestedStep = currentStepParam && steps.includes(currentStepParam) ? currentStepParam : 'resume';
      // If we have outputs, route to appropriate step based on completion
      if (outputs) {
        const firstIncompleteStep = getFirstIncompleteStep();
        setCurrentStep(requestedStep === 'resume' ? firstIncompleteStep : requestedStep);
      } else {
        setCurrentStep(requestedStep);
      }
    }
  }, [searchParams, loadToolkitIntoBuilder, getFirstIncompleteStep, outputs, currentStepParam]);

  useEffect(() => {
    // Update URL when step changes (but not during toolkit loading)
    const toolkitId = searchParams.get('toolkit');
    if (!toolkitId) {
      setSearchParams({ step: currentStep });
    }
  }, [currentStep, setSearchParams, searchParams]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getCurrentStepIndex = () => steps.indexOf(currentStep);
  
  const canProceed = () => {
    switch (currentStep) {
      case 'resume': {
        const resumeText = outputs?.resume?.trim() ?? '';
        const words = resumeText ? getWordCount(resumeText) : 0;
        return (
          flags.hasRunResume &&
          resumeText.length > 0 &&
          words <= 550 &&
          !status.loading
        );
      }
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