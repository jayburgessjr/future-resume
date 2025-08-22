"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/stores";
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

type FlowStep = "resume" | "cover-letter" | "highlights" | "interview";
const steps: FlowStep[] = ["resume", "cover-letter", "highlights", "interview"];

const safeStep = (s: string | null): FlowStep =>
  steps.includes(s as FlowStep) ? (s as FlowStep) : "resume";

/** Minimal modal with ESC/overlay close + body scroll lock. No external UI lib. */
function InlineModal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      // focus container for accessibility
      setTimeout(() => boxRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={boxRef}
        tabIndex={-1}
        className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background shadow-xl"
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="max-h-[60vh] overflow-auto p-4">{children}</div>
        <div className="p-4 border-t flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

export default function BuilderFlowPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    settings,
    outputs,
    status,
    loadToolkitIntoBuilder,
    // Remove auto-generation from this component - let StepResume handle it
  } = useAppDataStore();

  const getFirstIncompleteStep = () => {
    if (!outputs?.resume) return "resume";
    if (!outputs?.coverLetter) return "cover-letter";
    if (!outputs?.highlights?.length) return "highlights";
    if (!outputs?.toolkit) return "interview";
    return null;
  };

  // Preload toolkit then clean URL (?toolkit) and set step
  useEffect(() => {
    const toolkitId = searchParams.get("toolkit");
    if (!toolkitId) return;
    let cancelled = false;
    (async () => {
      try {
        const maybeStep =
          (await (loadToolkitIntoBuilder as any)(toolkitId)) as
            | FlowStep
            | undefined;
        const nextStep = safeStep(
          (maybeStep as string) || getFirstIncompleteStep() || "resume"
        );
        if (cancelled) return;
        const next = new URLSearchParams(searchParams);
        next.delete("toolkit");
        next.set("step", nextStep);
        setSearchParams(next, { replace: true });
      } catch (e) {
        if (cancelled) return;
        const next = new URLSearchParams(searchParams);
        next.delete("toolkit");
        next.set("step", "resume");
        setSearchParams(next, { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("toolkit")]);

  // URL drives current step
  const currentStep: FlowStep = safeStep(searchParams.get("step"));
  const getCurrentStepIndex = () => steps.indexOf(currentStep);

  // Track resume text and preview flag
  const resumeText = outputs?.resume?.trim() ?? "";
  const resumeWords = (resumeText.match(/\S+/g) || []).length;
  const resumeWithinLimit = resumeText.length > 0 && resumeWords <= 550;
  const isResumePreviewed = searchParams.get("resumePreviewed") === "1";

  // If resume changes, clear preview flag so user must re-confirm
  const lastResumeRef = useRef<string>("");
  useEffect(() => {
    const txt = outputs?.resume?.trim() ?? "";
    if (txt !== lastResumeRef.current) {
      lastResumeRef.current = txt;
      if (searchParams.get("resumePreviewed") === "1") {
        const next = new URLSearchParams(searchParams);
        next.delete("resumePreviewed");
        setSearchParams(next, { replace: true });
      }
    }
  }, [outputs?.resume, searchParams, setSearchParams]);

  // Gating (require preview confirmation on resume)
  const canProceed = () => {
    switch (currentStep) {
      case "resume":
        return resumeWithinLimit && isResumePreviewed && !status.loading;
      case "cover-letter":
        return !!outputs?.coverLetter && !status.loading;
      case "highlights":
        return !!outputs?.highlights?.length && !status.loading;
      case "interview":
        return !!outputs?.toolkit && !status.loading;
      default:
        return false;
    }
  };

  // URL-preserving navigation helpers
  const goTo = (step: FlowStep) => {
    const next = new URLSearchParams(searchParams);
    next.set("step", step);
    setSearchParams(next, { replace: true });
  };

  const handleNext = () => {
    const idx = getCurrentStepIndex();
    if (idx < steps.length - 1) goTo(steps[idx + 1]);
  };
  const handleBack = () => {
    const idx = getCurrentStepIndex();
    if (idx > 0) goTo(steps[idx - 1]);
  };
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Resume preview
  const openResumePreview = () => {
    if (currentStep !== "resume") return;
    if (!resumeWithinLimit) return;
    setIsPreviewOpen(true);
  };
  const confirmResumePreview = () => {
    const next = new URLSearchParams(searchParams);
    next.set("resumePreviewed", "1");
    setSearchParams(next, { replace: true });
    setIsPreviewOpen(false);
    // Auto-advance
    const idx = getCurrentStepIndex();
    if (idx < steps.length - 1) goTo(steps[idx + 1]);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "resume":
        return <StepResume />;
      case "cover-letter":
        return <StepCoverLetter />;
      case "highlights":
        return <StepHighlights />;
      case "interview":
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
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                >
                  <User className="w-3 h-3" />
                  {user.email?.split("@")[0]}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
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

      {/* Stepper */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Stepper
            currentStep={currentStep}
            steps={steps}
            onStepClick={(step) => {
              const target = step as FlowStep;
              const targetIdx = steps.indexOf(target);
              const currentIdx = getCurrentStepIndex();
              if (targetIdx <= currentIdx || canProceed()) {
                goTo(target);
              }
            }}
          />
        </div>
      </div>

      {/* Settings */}
      <ReviewBar settings={settings} />

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
            <CardContent className="p-0">{renderStep()}</CardContent>
          </Card>

          {currentStep === "resume" && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Generate your résumé, then preview to continue.
                {!resumeWithinLimit && (
                  <span className="ml-2 text-destructive">
                    Ensure it's not empty and ≤ 550 words.
                  </span>
                )}
                {resumeWithinLimit && !isResumePreviewed && (
                  <span className="ml-2">Preview required.</span>
                )}
                {isResumePreviewed && (
                  <span className="ml-2 text-green-600">Preview confirmed.</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={openResumePreview}
                  disabled={!resumeWithinLimit || status.loading}
                >
                  Preview Résumé
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <FlowFooter
        currentStep={currentStep}
        currentStepIndex={getCurrentStepIndex()}
        totalSteps={steps.length}
        canProceed={canProceed()}
        onNext={handleNext}
        onBack={handleBack}
        isLoading={status.loading}
      />

      {/* Inline Modal (no external lib) */}
      <InlineModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Résumé"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={confirmResumePreview} disabled={!resumeWithinLimit || status.loading}>
              Confirm & Continue
            </Button>
          </>
        }
      >
        {resumeText ? (
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">
            {resumeText}
          </pre>
        ) : (
          <div className="text-sm text-muted-foreground">No résumé content yet.</div>
        )}
        <div className="mt-3 text-xs text-muted-foreground">{resumeWords} words · limit 550</div>
      </InlineModal>
    </div>
  );
}
