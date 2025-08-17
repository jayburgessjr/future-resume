import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Upload, FileText, Sparkles, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/stores/appData";
import { usePersistenceStore } from "@/stores/persistenceStore";
import { VersionHistory } from "@/components/resume/VersionHistory";
import { ExportBar } from "@/components/export/ExportBar";
import { CompanySignalPanel } from "@/components/company/CompanySignalPanel";
import { useToast } from "@/hooks/use-toast";

const ResumeBuilderPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    settings,
    inputs,
    outputs,
    status,
    updateSettings,
    updateInputs,
    runGeneration,
    getWordCount,
    isOverLimit,
    isReadyToGenerate
  } = useAppDataStore();

  const { loadVersions, currentResumeId } = usePersistenceStore();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (user && currentResumeId) {
      loadVersions(currentResumeId);
    }
  }, [user, currentResumeId, loadVersions]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    try {
      await runGeneration();
      toast({
        title: "Resume Generated!",
        description: user ? "Your resume has been generated and saved" : "Your resume has been generated",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please check your inputs and try again",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
        return <PreviewStep settings={settings} inputs={inputs} outputs={outputs} />;
      default:
        return <ConfigurationStep settings={settings} updateSettings={updateSettings} />;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return settings.mode && settings.voice && settings.format;
      case 2:
        return inputs.resumeText.trim().length >= 50;
      case 3:
        return inputs.jobText.trim().length >= 50;
      case 4:
        return isReadyToGenerate();
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="text-xl font-bold text-foreground">Resume Builder</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {user.email}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    {getStepTitle(currentStep)}
                  </CardTitle>
                  <CardDescription>
                    {getStepDescription(currentStep)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {renderStep()}
                  
                  {/* Navigation */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="btn-secondary"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    {currentStep < totalSteps ? (
                      <Button 
                        onClick={handleNext} 
                        className="btn-primary"
                        disabled={!canProceed()}
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        className="btn-hero"
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

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <Card className="card-elegant sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>
                    Your resume will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {outputs?.resume ? (
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans">
                            {outputs.resume.slice(0, 500)}...
                          </pre>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Words: {getWordCount(outputs.resume)}/550
                          {isOverLimit(outputs.resume, 550) && (
                            <span className="text-destructive ml-2">Over limit!</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Export Bar */}
                      <ExportBar 
                        content={outputs.resume}
                        title="Resume"
                        metadata={{
                          generatedAt: status.lastGenerated,
                          settings,
                          wordCount: getWordCount(outputs.resume)
                        }}
                        className="text-xs"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Complete the form to see your resume preview
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Company Signal Panel */}
            <div className="lg:col-span-1">
              <CompanySignalPanel />
            </div>

            {/* Version History Section (only for authenticated users) */}
            {user && (
              <div className="lg:col-span-1">
                <VersionHistory />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Step Components
const ConfigurationStep = ({ settings, updateSettings }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mode">Resume Mode</Label>
          <Select value={settings.mode} onValueChange={(value) => updateSettings({ mode: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select resume mode" />
            </SelectTrigger>
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
            <SelectTrigger>
              <SelectValue placeholder="Select voice style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first-person">First Person (I, my, me)</SelectItem>
              <SelectItem value="third-person">Third Person (they, their)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select value={settings.format} onValueChange={(value) => updateSettings({ format: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select output format" />
            </SelectTrigger>
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
          <Switch
            checked={settings.includeTable}
            onCheckedChange={(checked) => updateSettings({ includeTable: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="proofread">AI Proofreading</Label>
            <p className="text-sm text-muted-foreground">Enhance grammar and clarity</p>
          </div>
          <Switch
            checked={settings.proofread}
            onCheckedChange={(checked) => updateSettings({ proofread: checked })}
          />
        </div>
      </div>
    </div>
  );
};

const ResumeInputStep = ({ inputs, updateInputs }) => {
  return (
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
        <p className="text-sm text-muted-foreground">
          {inputs.resumeText.length} characters (minimum 50 required)
        </p>
      </div>
    </div>
  );
};

const JobDescriptionStep = ({ inputs, updateInputs }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="job-description">Target Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Paste the job description you're applying for. Our AI will tailor your resume to match the requirements..."
          value={inputs.jobText}
          onChange={(e) => updateInputs({ jobText: e.target.value })}
          className="min-h-[300px]"
        />
        <p className="text-sm text-muted-foreground">
          {inputs.jobText.length} characters (minimum 50 required)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-signal">Company Signal (Optional)</Label>
        <Textarea
          id="company-signal"
          placeholder="e.g., 'I'm excited about your company's commitment to sustainability...'"
          value={inputs.companySignal || ''}
          onChange={(e) => updateInputs({ companySignal: e.target.value })}
          className="min-h-[100px]"
          maxLength={100}
        />
        <p className="text-sm text-muted-foreground">
          Personal hook for cover letters ({(inputs.companySignal || '').length}/100)
        </p>
      </div>
    </div>
  );
};

const PreviewStep = ({ settings, inputs, outputs }) => {
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mode:</span>
            <span className="ml-2 font-medium capitalize">{settings.mode || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Voice:</span>
            <span className="ml-2 font-medium capitalize">{settings.voice || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Format:</span>
            <span className="ml-2 font-medium capitalize">{settings.format || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Skills Table:</span>
            <span className="ml-2 font-medium">{settings.includeTable ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ready to Generate!</h3>
        <p className="text-muted-foreground">
          Your resume will be generated based on your configuration and inputs. 
          {outputs ? " Your previous resume will be updated." : ""}
        </p>
      </div>
    </div>
  );
};

// Helper Functions
const getStepTitle = (step: number) => {
  switch (step) {
    case 1: return "Configuration";
    case 2: return "Resume Input";
    case 3: return "Job Description";
    case 4: return "Review & Generate";
    default: return "Configuration";
  }
};

const getStepDescription = (step: number) => {
  switch (step) {
    case 1: return "Choose how you want your resume formatted and styled";
    case 2: return "Enter your current resume content";
    case 3: return "Provide the job description to tailor your resume";
    case 4: return "Review your settings and generate your optimized resume";
    default: return "Configure your resume settings";
  }
};

export default ResumeBuilderPage;