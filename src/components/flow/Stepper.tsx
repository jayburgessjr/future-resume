import { Check, FileText, Mail, Star, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { preserveQuery } from "@/lib/route";

interface StepperProps {
  currentStep: string;
  steps: string[];
  onStepClick: (step: string) => void;
}

const stepConfig = {
  'resume': { label: 'Resume', icon: FileText },
  'cover-letter': { label: 'Cover Letter', icon: Mail },
  'highlights': { label: 'Highlights', icon: Star },
  'interview': { label: 'Interview', icon: MessageCircle },
};

export const Stepper = ({ currentStep, steps, onStepClick }: StepperProps) => {
  const getCurrentStepIndex = () => steps.indexOf(currentStep);
  const navigate = useNavigate();
  const location = useLocation();

  const goToStep = (step: string) => {
    const current = new URLSearchParams(location.search);
    const merged = preserveQuery(current, { step });
    navigate({ pathname: location.pathname, search: merged.toString() }, { replace: true });
    onStepClick(step);
  };

  return (
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const config = stepConfig[step as keyof typeof stepConfig];
        const Icon = config.icon;
        const isCompleted = index < getCurrentStepIndex();
        const isCurrent = step === currentStep;
        const isAccessible = index <= getCurrentStepIndex();

        return (
          <div key={step} className="flex items-center">
            <button
              onClick={() => isAccessible && goToStep(step)}
              disabled={!isAccessible}
              className={`
                flex flex-col items-center space-y-2 p-3 rounded-xl transition-all
                ${isAccessible ? 'cursor-pointer hover:bg-accent/10' : 'cursor-not-allowed opacity-50'}
              `}
            >
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isCompleted 
                    ? 'bg-primary text-white' 
                    : isCurrent 
                    ? 'bg-accent text-white ring-2 ring-accent/30' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`
                  text-sm font-medium transition-colors hidden sm:block
                  ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                `}
              >
                {config.label}
              </span>
            </button>
            
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-border mx-2" />
            )}
          </div>
        );
      })}
    </div>
  );
};