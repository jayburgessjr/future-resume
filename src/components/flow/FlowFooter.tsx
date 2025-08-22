import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import { SaveToolkitButton } from "./SaveToolkitButton";

interface FlowFooterProps {
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const FlowFooter = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  canProceed,
  onNext,
  onBack,
  isLoading,
}: FlowFooterProps) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm sticky bottom-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isFirstStep || isLoading}
            className="px-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {isLastStep && (
              <SaveToolkitButton />
            )}
            
            {!isLastStep && (
              <Button
                onClick={onNext}
                disabled={!canProceed || isLoading}
                className="bg-gradient-to-r from-primary to-accent text-white px-6 hover:scale-105 transition-transform"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};