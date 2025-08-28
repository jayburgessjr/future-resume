import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit3, Eye, Save } from "lucide-react";

interface StepNavigationProps {
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  canProceed: boolean;
  canGoBack: boolean;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  showPreview?: boolean;
  onPreview?: () => void;
}

const stepLabels = {
  'resume': 'Generate Resume',
  'cover-letter': 'Cover Letter', 
  'highlights': 'Recruiter Highlights',
  'interview': 'Interview Toolkit'
};

export const StepNavigation = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  canProceed,
  canGoBack,
  isLoading,
  onNext,
  onBack,
  onSaveDraft,
  showPreview = false,
  onPreview
}: StepNavigationProps) => {
  const currentStepLabel = stepLabels[currentStep as keyof typeof stepLabels] || currentStep;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and step info */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={!canGoBack || isLoading}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                Step {currentStepIndex + 1} of {totalSteps}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {currentStepLabel}
              </span>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-3">
            {/* Save Draft Button */}
            {onSaveDraft && (
              <Button
                variant="ghost"
                onClick={onSaveDraft}
                disabled={isLoading}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
            )}

            {/* Preview Button */}
            {showPreview && onPreview && (
              <Button
                variant="outline"
                onClick={onPreview}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            )}

            {/* Next/Complete Button */}
            <Button
              onClick={onNext}
              disabled={!canProceed || isLoading}
              className={`flex items-center gap-2 min-w-[120px] ${
                isLastStep 
                  ? 'bg-gradient-to-r from-success to-accent text-white hover:from-success/90 hover:to-accent/90' 
                  : 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : isLastStep ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Complete
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 w-full bg-muted/30 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + (canProceed ? 1 : 0)) / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};