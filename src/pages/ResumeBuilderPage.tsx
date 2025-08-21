// app/pages/ResumeBuilderPage.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, ArrowRight, FileText, Sparkles, User, LogOut, Settings, PenTool, Building2, Eye, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// If your store is named useAppData, change this import to: import { useAppData } from "@/stores/appData";
import { useAppDataStore, selectGeneratedResume } from "@/stores/appData";
import { usePersistenceStore } from "@/stores/persistenceStore";
import { VersionHistory } from "@/components/resume/VersionHistory";
import { ExportBar } from "@/components/export/ExportBar";
import { CompanySignalStep } from "@/components/builder/CompanySignalStep";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { QAPanel } from "@/components/qa/QAPanel";
import { useToast } from "@/hooks/use-toast";
import { DevPreviewProbe } from "@/dev/DevPreviewProbe";

// ---------- helpers ----------
const safeWordCount = (s: string) => (s ? (s.match(/\S+/g) || []).length : 0);

// ---------- page ----------
const ResumeBuilderPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    settings,
    inputs,
    status,
    updateSettings,
    updateInputs,
    runGeneration,        // must return a string and set outputs.resume (see note at bottom)
    isReadyToGenerate
  } = useAppDataStore();

  const { loadVersions, currentResumeId } = usePersistenceStore();

  const totalSteps = 5;

  const generatedFromStore = useAppDataStore(selectGeneratedResume);
  const [localPreview, setLocalPreview] = useState<string>("");
  const generated = localPreview || generatedFromStore;
  const generatedWords = useMemo(() => (generated.match(/\S+/g) || []).length, [generated]);

  useEffect(() => {
    if (user && currentResumeId) loadVersions(currentResumeId);
  }, [user, currentResumeId, loadVersions]);

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep((s) => s + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep((s) => s - 1); };

  const handleGenerate = async () => {
    try {
      const text = await runGeneration(); // expect a string
      const finalText = (typeof text === "string" && text.trim()) || generatedFromStore || "";
      if (finalText) {
        setLocalPreview(finalText); // show immediately
        toast({ title: "Targeted resume generated", description: "Preview updated" });
        setCurrentStep(5); // jump to review so they see it
      } else {
        toast({
          title: "Generated but no content detected",
          description: "Ensure runGeneration() returns a string and sets outputs.resume",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Please check your inputs and try again",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ConfigurationStep settings={settings} updateSettings={updateSettings} />;
      case 2:
        return <ResumeInputStep inputs={inputs} updateInputs={updateInputs} />;
      case 3:
        return <JobDescriptionStep inputs={inputs} updateInputs={updateInputs} />;
      case 4:
        return <CompanySignalStep />;
      case 5:
        // Inject the resolved generated text so Preview always shows
        return <PreviewStep settings={settings} outputs={{ resume: generated }} />;
      default:
        return <ConfigurationStep settings={settings} updateSettings={updateSettings} />;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!settings.mode && !!settings.voice && !!settings.format;
      case 2:
        return inputs.resumeText.trim().length >= 50;
      case 3:
        return inputs.jobText.trim().length >= 50;
      case 4:
        return true; // optional
      case 5:
        return isReadyToGenerate();
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="relative">
              <FileText className="h-8 w-8 text-accent" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Resume Builder Pro</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Career Success</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <SubscriptionBadge />
                <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
                  <User className="w-3 h-3" />
                  {user.email?.split("@")[0]}
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

      {/* Progress */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step < currentStep
                        ? "bg-primary text-white"
                        : step === currentStep
                        ? "bg-accent text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step < currentStep ? <Sparkles className="w-4 h-4" /> : step}
                  </div>
                  <div className="hidden lg:block">
                    <p className={`text-sm font-medium ${step <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                      {getStepTitle(step)}
                    </p>
                  </div>
                  {step < 5 && <div className="w-8 h-0.5 bg-border mx-2" />}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                      {getStepIcon(currentStep)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{getStepTitle(currentStep)}</CardTitle>
                      <CardDescription className="text-base">{getStepDescription(currentStep)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {renderStep()}

                  {/* Nav */}
                  <div className="flex justify-between pt-6 border-t border-border/50">
                    <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="px-6">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-primary to-accent text-white px-6 hover:scale-105 transition-transform"
                        disabled={!canProceed()}
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        className="bg-gradient-to-r from-primary to-accent text-white px-8 hover:scale-105 transition-transform"
                        onClick={handleGenerate}
                        disabled={status.loading || !isReadyToGenerate()}
                      >
                        {status.loading ? "Generating..." : "Generate Resume"}
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview + Tools */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {generated ? (
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans">
                          {generated.length > 1000 ? `${generated.slice(0, 1000)}…` : generated}
                        </pre>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Words: {generatedWords}/550 {generatedWords > 550 && <span className="text-destructive ml-2">Over limit</span>}
                        </div>
                      </div>

                      <FeatureGuard feature="exports">
                        <ExportBar
                          content={generated}
                          title="Resume"
                          metadata={{
                            generatedAt: status.lastGenerated,
                            settings,
                            wordCount: generatedWords
                          }}
                          className="text-xs"
                        />
                      </FeatureGuard>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Resume ready to generate — click Generate.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <DevPreviewProbe />

              {user && (
                <FeatureGuard feature="version_history">
                  <VersionHistory />
                </FeatureGuard>
              )}
            </div>
          </div>
        </div>
      </main>

      <QAPanel />
    </div>
  );
};

// ----- Step components -----
const ConfigurationStep = ({ settings, updateSettings }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mode">Resume Mode</Label>
          <Select value={settings.mode} onValueChange={(value) => updateSettings({ mode: value })}>
            <SelectTrigger><SelectValue placeholder="Select resume mode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise (≤350 words)</SelectItem>
              <SelectItem value="detailed">Detailed (≤550 words)</SelectItem>
              <SelectItem value="executive">Executive (≤450 words)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice">Voice Style</Label>
          <Select value={settings.voice} onValueChange={(value) => updateSettings({ voice: value })}>
            <SelectTrigger><SelectValue placeholder="Select voice style" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="first-person">First Person</SelectItem>
              <SelectItem value="third-person">Third Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select value={settings.format} onValueChange={(value) => updateSettings({ format: value })}>
            <SelectTrigger><SelectValue placeholder="Select output format" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="plain_text">Plain Text</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="include-table">Include Skills Table</Label>
            <p className="text-sm text-muted-foreground">Add a structured skills section</p>
          </div>
          <Switch checked={settings.includeTable} onCheckedChange={(checked) => updateSettings({ includeTable: checked })} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="proofread">AI Proofreading</Label>
            <p className="text-sm text-muted-foreground">Enhance grammar and clarity</p>
          </div>
          <Switch checked={settings.proofread} onCheckedChange={(checked) => updateSettings({ proofread: checked })} />
        </div>
      </div>
    </div>
  );
};

const ResumeInputStep = ({ inputs, updateInputs }) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="manual-entry">Resume Content</Label>
      <Textarea
        id="manual-entry"
        placeholder="Paste your current resume content here or start typing..."
        value={inputs.resumeText}
        onChange={(e) => updateInputs({ resumeText: e.target.value })}
        className="min-h-[300px]"
      />
      <p className="text-sm text-muted-foreground">{inputs.resumeText.length} characters (minimum 50 required)</p>
    </div>
  </div>
);

const JobDescriptionStep = ({ inputs, updateInputs }) => (
  <div className="space-y-8">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
        <FileText className="h-8 w-8 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Job Requirements</h2>
        <p className="text-muted-foreground">Paste the job description to tailor your resume</p>
      </div>
    </div>

    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="job-description" className="text-base font-medium">Target Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Paste the complete job description here."
          value={inputs.jobText}
          onChange={(e) => updateInputs({ jobText: e.target.value })}
          className="min-h-[200px] text-base"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{inputs.jobText.length} characters (minimum 50 required)</p>
          <Badge variant={inputs.jobText.length >= 50 ? "default" : "outline"}>
            {inputs.jobText.length >= 50 ? "Ready" : "Needs more"}
          </Badge>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Pro Tip</h4>
              <p className="text-xs text-muted-foreground">
                Include the complete job description for best results. The AI will extract key requirements and optimize your resume accordingly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const PreviewStep = ({ settings, outputs }) => {
  const text = outputs?.resume ?? "";
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Mode:</span><span className="ml-2 font-medium capitalize">{settings.mode || "Not set"}</span></div>
          <div><span className="text-muted-foreground">Voice:</span><span className="ml-2 font-medium capitalize">{settings.voice || "Not set"}</span></div>
          <div><span className="text-muted-foreground">Format:</span><span className="ml-2 font-medium capitalize">{settings.format || "Not set"}</span></div>
          <div><span className="text-muted-foreground">Skills Table:</span><span className="ml-2 font-medium">{settings.includeTable ? "Yes" : "No"}</span></div>
        </div>
      </div>

      {!text ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ready to Generate</h3>
          <p className="text-muted-foreground">Your resume will be generated based on your configuration and inputs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Resume</h3>
          <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{text}</pre>
          </div>
          <FeatureGuard feature="exports">
            <ExportBar content={text} title="Resume" metadata={{ wordCount: safeWordCount(text) }} className="text-xs" />
          </FeatureGuard>
        </div>
      )}
    </div>
  );
};

// helpers for labels/icons
const getStepTitle = (step: number) => {
  switch (step) {
    case 1: return "Configuration";
    case 2: return "Resume Input";
    case 3: return "Job Description";
    case 4: return "Company Intelligence";
    case 5: return "Review and Generate";
    default: return "Configuration";
  }
};
const getStepDescription = (step: number) => {
  switch (step) {
    case 1: return "Choose how you want your resume formatted and styled";
    case 2: return "Enter your current resume content";
    case 3: return "Provide the job description to tailor your resume";
    case 4: return "Add recent company news to personalize your application";
    case 5: return "Review your settings and generate your optimized resume";
    default: return "Configuration settings";
  }
};
const getStepIcon = (step: number) => {
  switch (step) {
    case 1: return <Settings className="h-5 w-5 text-white" />;
    case 2: return <PenTool className="h-5 w-5 text-white" />;
    case 3: return <FileText className="h-5 w-5 text-white" />;
    case 4: return <Building2 className="h-5 w-5 text-white" />;
    case 5: return <Eye className="h-5 w-5 text-white" />;
    default: return <Settings className="h-5 w-5 text-white" />;
  }
};

export default ResumeBuilderPage;

/**
 * NOTE FOR YOUR STORE (do this once; not part of this page at runtime)
 *
 * Ensure runGeneration returns a string and writes to outputs.resume immutably.
 *
 *   runGeneration: async () => {
 *     set(s => ({ status: { ...s.status, loading: true } }));
 *     try {
 *       const text = await apiGenerate(/* your backend call * /);
 *       set(s => ({
 *         outputs: { ...s.outputs, resume: text, latest: text, variants: { targeted: text } },
 *         status: { loading: false, lastGenerated: new Date().toISOString() },
 *       }));
 *       return text; // critical for instant preview
 *     } catch (e) {
 *       set(s => ({ status: { ...s.status, loading: false } }));
 *       throw e;
 *     }
 *   }
 */
