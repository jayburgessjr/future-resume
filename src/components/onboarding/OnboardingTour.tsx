import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Best Darn Resume!',
    description: 'Let\'s take a quick tour to help you get the most out of our AI-powered resume builder.',
    target: 'dashboard-header',
    position: 'bottom',
    icon: <Sparkles className="w-4 h-4" />
  },
  {
    id: 'master-resume',
    title: 'Your Master Resume',
    description: 'This is your foundation. Upload your current resume here - we\'ll use it to create targeted versions for specific jobs.',
    target: 'master-resume-card',
    position: 'right'
  },
  {
    id: 'job-applications',
    title: 'Track Job Applications',
    description: 'Add jobs you\'re applying to. We\'ll help you create customized application materials for each one.',
    target: 'job-list',
    position: 'left'
  },
  {
    id: 'resume-builder',
    title: 'AI Resume Builder',
    description: 'Our 4-step process creates a complete application package: targeted resume, cover letter, recruiter highlights, and interview prep.',
    target: 'resume-builder-button',
    position: 'bottom'
  },
  {
    id: 'toolkits',
    title: 'Generated Toolkits',
    description: 'All your completed application packages are saved here. Export them as PDF or Word documents.',
    target: 'toolkits-section',
    position: 'top'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour = ({ isOpen, onComplete, onSkip }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen) return;

    const findTarget = () => {
      const element = document.getElementById(step.target) || 
                     document.querySelector(`[data-tour="${step.target}"]`);
      if (element) {
        setTargetElement(element);
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        // Add highlight effect
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        element.classList.add('tour-highlight');
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(findTarget, 100);
    return () => clearTimeout(timer);
  }, [currentStep, step.target, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Clean up highlights when tour ends
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
        (el as HTMLElement).style.position = '';
        (el as HTMLElement).style.zIndex = '';
      });
    }
  }, [isOpen]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const getTooltipPosition = (): React.CSSProperties => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + (rect.width - tooltipWidth) / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width - tooltipWidth) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipHeight) / 2;
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipHeight) / 2;
        left = rect.right + offset;
        break;
    }

    // Keep tooltip within viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 1001
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[999]" />

      {/* Tour Tooltip */}
      <Card 
        className="shadow-2xl border-2 border-primary/20 bg-card"
        style={getTooltipPosition()}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {step.icon}
              <Badge variant="secondary" className="text-xs">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-1"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Skip option */}
          {!isLastStep && (
            <div className="text-center mt-4">
              <button
                onClick={onSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Styles for tour highlighting */}
      <style>{`
        .tour-highlight {
          position: relative;
          background: rgba(var(--primary), 0.1);
          border-radius: 8px;
          box-shadow: 0 0 0 2px rgba(var(--primary), 0.3);
          transition: all 0.3s ease;
        }
        
        .tour-highlight::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 12px;
          background: linear-gradient(45deg, transparent, rgba(var(--primary), 0.2), transparent);
          z-index: -1;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};