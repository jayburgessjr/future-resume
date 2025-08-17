import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, FileText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ResumeBuilderPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    mode: "",
    voice: "",
    format: "",
    includeTable: false,
    proofread: true,
    resumeFile: null,
    jobDescription: "",
    manualEntry: ""
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ConfigurationStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <ResumeInputStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <JobDescriptionStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <PreviewStep formData={formData} />;
      default:
        return <ConfigurationStep formData={formData} setFormData={setFormData} />;
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
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
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
                      <Button onClick={handleNext} className="btn-primary">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button className="btn-hero">
                        Generate Resume
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
                  <div className="bg-muted/30 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Complete the form to see your resume preview
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Step Components
const ConfigurationStep = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mode">Resume Mode</Label>
          <Select value={formData.mode} onValueChange={(value) => setFormData({...formData, mode: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select resume mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice">Voice Style</Label>
          <Select value={formData.voice} onValueChange={(value) => setFormData({...formData, voice: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first-person">First Person</SelectItem>
              <SelectItem value="third-person">Third Person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Output Format</Label>
          <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
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
            checked={formData.includeTable}
            onCheckedChange={(checked) => setFormData({...formData, includeTable: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="proofread">AI Proofreading</Label>
            <p className="text-sm text-muted-foreground">Enhance grammar and clarity</p>
          </div>
          <Switch
            checked={formData.proofread}
            onCheckedChange={(checked) => setFormData({...formData, proofread: checked})}
          />
        </div>
      </div>
    </div>
  );
};

const ResumeInputStep = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-center p-8 border-2 border-dashed border-border rounded-lg hover:border-accent/50 transition-colors cursor-pointer">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Current Resume</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your resume file or click to browse
          </p>
          <Button variant="outline" className="btn-secondary">
            Choose File
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Supports PDF, DOC, DOCX files
          </p>
        </div>
      </div>

      <div className="text-center text-muted-foreground">
        <span>or</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manual-entry">Manual Entry</Label>
        <Textarea
          id="manual-entry"
          placeholder="Paste your current resume content here or start typing..."
          value={formData.manualEntry}
          onChange={(e) => setFormData({...formData, manualEntry: e.target.value})}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};

const JobDescriptionStep = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="job-description">Target Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Paste the job description you're applying for. Our AI will tailor your resume to match the requirements..."
          value={formData.jobDescription}
          onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
          className="min-h-[300px]"
        />
        <p className="text-sm text-muted-foreground">
          Tip: Include the full job posting for best results
        </p>
      </div>
    </div>
  );
};

const PreviewStep = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mode:</span>
            <span className="ml-2 font-medium capitalize">{formData.mode || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Voice:</span>
            <span className="ml-2 font-medium capitalize">{formData.voice || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Format:</span>
            <span className="ml-2 font-medium capitalize">{formData.format || "Not set"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Skills Table:</span>
            <span className="ml-2 font-medium">{formData.includeTable ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ready to Generate!</h3>
        <p className="text-muted-foreground">
          Your resume will be generated based on your configuration and inputs. 
          Click "Generate Resume" to create your optimized resume.
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
    case 2: return "Upload your current resume or enter your information manually";
    case 3: return "Provide the job description to tailor your resume";
    case 4: return "Review your settings and generate your optimized resume";
    default: return "Configure your resume settings";
  }
};

export default ResumeBuilderPage;