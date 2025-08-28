import { Check, FileText, Mail, Star, MessageCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StepperProps {
  currentStep: string;
  steps: string[];
  onStepClick: (step: string) => void;
  completedSteps?: string[];
  canAccessStep?: (step: string) => boolean;
}

const stepConfig = {
  'resume': { label: 'Resume', icon: FileText },
  'cover-letter': { label: 'Cover Letter', icon: Mail },
  'highlights': { label: 'Highlights', icon: Star },
  'interview': { label: 'Interview', icon: MessageCircle },
};

export const Stepper = ({ 
  currentStep, 
  steps, 
  onStepClick,
  completedSteps = [],
  canAccessStep = () => true 
}: StepperProps) => {
  const getCurrentStepIndex = () => steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const config = stepConfig[step as keyof typeof stepConfig];
        const Icon = config.icon;
        const isCompleted = index < getCurrentStepIndex();
        const isCurrent = step === currentStep;
        const isAccessible = index <= getCurrentStepIndex();

        const isStepCompleted = completedSteps.includes(step);
        const canAccess = canAccessStep(step);
        const isClickable = canAccess && (isStepCompleted || isCurrent || index <= getCurrentStepIndex());

        return (
          <div key={step} className="flex items-center">
            <div className="relative">
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200
                  ${isClickable 
                    ? 'cursor-pointer hover:bg-accent/10 hover:scale-105' 
                    : 'cursor-not-allowed opacity-50'
                  }
                `}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                    ${isStepCompleted 
                      ? 'bg-success text-white shadow-lg' 
                      : isCurrent 
                      ? 'bg-accent text-white ring-2 ring-accent/30 shadow-lg' 
                      : canAccess
                      ? 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background'
                      : 'bg-muted/50 text-muted-foreground/50'
                    }
                  `}
                >
                  {isStepCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : !canAccess ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <span
                    className={`
                      text-sm font-medium transition-colors hidden sm:block
                      ${isCurrent ? 'text-foreground' : isStepCompleted ? 'text-success' : 'text-muted-foreground'}
                    `}
                  >
                    {config.label}
                  </span>
                  {isStepCompleted && (
                    <Badge variant="outline" className="text-xs px-2 py-0 bg-success/10 text-success border-success/20 hidden sm:block">
                      Complete
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="outline" className="text-xs px-2 py-0 bg-accent/10 text-accent border-accent/20 hidden sm:block">
                      Current
                    </Badge>
                  )}
                </div>
              </button>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 transition-colors ${
                isStepCompleted ? 'bg-success/50' : 'bg-border'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};