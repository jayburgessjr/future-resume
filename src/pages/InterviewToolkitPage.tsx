import { ToolkitAccordion } from '@/components/interview/ToolkitAccordion';
import { useAppDataStore } from '@/stores/appData';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Brain, RefreshCw, Copy, Download, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ToolkitData {
  introScript?: string;
  carlQuestions?: string[];
  soarQuestions?: string[];
  interviewerQuestions?: string[];
  followUpEmail?: string;
  skillGaps?: string[];
  learningResources?: string[];
  linkedinOutreach?: string;
  kpiDashboard?: string;
}

export default function InterviewToolkitPage() {
  const { 
    outputs, 
    status, 
    settings,
    runGeneration,
    isReadyToGenerate,
    getWordCount,
    isOverLimit
  } = useAppDataStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!isReadyToGenerate()) {
      toast({
        title: "Missing Inputs",
        description: "Please add resume and job description in the builder first",
        variant: "destructive",
      });
      return;
    }

    try {
      await runGeneration();
      
      toast({
        title: "Toolkit Generated!",
        description: "Your interview toolkit is ready",
      });
    } catch (error) {
      console.error('Toolkit generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. Check your connection.",
        variant: "destructive",
      });
    }
  };

  // Map outputs to toolkit data
  const toolkitData: ToolkitData = outputs ? {
    interviewerQuestions: outputs.toolkit?.questions || [],
    followUpEmail: outputs.toolkit?.followUpEmail || '',
    skillGaps: outputs.toolkit?.skillGaps || [],
    kpiDashboard: outputs.weeklyKPITracker || '',
    // These would be populated when the AI logic expands
    introScript: '',
    carlQuestions: [],
    soarQuestions: [],
    learningResources: [],
    linkedinOutreach: '',
  } : {};

  // Check word limits
  const followUpWordCount = toolkitData.followUpEmail ? getWordCount(toolkitData.followUpEmail) : 0;
  const isFollowUpOverLimit = isOverLimit(toolkitData.followUpEmail || '', 200);

  const handleCopyAll = async () => {
    const allContent = [
      'INTERVIEW & NETWORKING TOOLKIT',
      '================================',
      '',
      'INTRO SCRIPT:',
      toolkitData.introScript || 'Not generated',
      '',
      'CARL QUESTIONS:',
      ...(toolkitData.carlQuestions || ['Not generated']),
      '',
      'SOAR QUESTIONS:',
      ...(toolkitData.soarQuestions || ['Not generated']),
      '',
      'INTERVIEWER QUESTIONS:',
      ...(toolkitData.interviewerQuestions || ['Not generated']),
      '',
      'FOLLOW-UP EMAIL:',
      toolkitData.followUpEmail || 'Not generated',
      '',
      'SKILL GAPS:',
      ...(toolkitData.skillGaps || ['Not generated']),
      '',
      'LEARNING RESOURCES:',
      ...(toolkitData.learningResources || ['Not generated']),
      '',
      'LINKEDIN OUTREACH:',
      toolkitData.linkedinOutreach || 'Not generated',
      '',
      'KPI TRACKER:',
      toolkitData.kpiDashboard || 'Not generated',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(allContent);
      toast({
        title: "Copied!",
        description: "Complete toolkit copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const allContent = [
      'INTERVIEW & NETWORKING TOOLKIT',
      '================================',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Settings: ${settings.mode} • ${settings.voice}`,
      '',
      'INTRO SCRIPT:',
      toolkitData.introScript || 'Not generated',
      '',
      'CARL QUESTIONS:',
      ...(toolkitData.carlQuestions || ['Not generated']),
      '',
      'SOAR QUESTIONS:',
      ...(toolkitData.soarQuestions || ['Not generated']),
      '',
      'INTERVIEWER QUESTIONS:',
      ...(toolkitData.interviewerQuestions || ['Not generated']),
      '',
      'FOLLOW-UP EMAIL:',
      toolkitData.followUpEmail || 'Not generated',
      '',
      'SKILL GAPS:',
      ...(toolkitData.skillGaps || ['Not generated']),
      '',
      'LEARNING RESOURCES:',
      ...(toolkitData.learningResources || ['Not generated']),
      '',
      'LINKEDIN OUTREACH:',
      toolkitData.linkedinOutreach || 'Not generated',
      '',
      'KPI TRACKER:',
      toolkitData.kpiDashboard || 'Not generated',
    ].join('\n');

    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-toolkit.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Toolkit saved as interview-toolkit.txt",
    });
  };

  const hasContent = Object.values(toolkitData).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
  const hasInputs = isReadyToGenerate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/builder" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Builder
              </Link>
            </Button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-accent-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">
                Interview & Networking Toolkit
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Comprehensive preparation materials for interviews, networking, and job search tracking
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-8">
          <Card className="card-elegant">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {hasContent ? 'Toolkit Generated' : 'Ready to Generate'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleGenerate}
                  variant="default"
                  disabled={status.loading}
                  className="btn-primary"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${status.loading ? 'animate-spin' : ''}`} />
                  {status.loading ? 'Generating...' : hasContent ? 'Refresh' : 'Generate'}
                </Button>
                
                {hasContent && (
                  <>
                    <Button onClick={handleCopyAll} variant="secondary" size="default">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </Button>
                    <Button onClick={handleDownload} variant="secondary" size="default">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {!hasContent && !status.loading && !hasInputs ? (
          <Card className="card-elegant">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Toolkit Generated</h3>
              <p className="text-muted-foreground mb-4">
                Add resume and job description in the builder first
              </p>
              <Button asChild variant="outline">
                <Link to="/builder">Go to Resume Builder</Link>
              </Button>
            </div>
          </Card>
        ) : status.loading ? (
          <Card className="card-elegant">
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-center">
                <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-4 animate-bounce"></div>
                <p className="text-muted-foreground">Generating your interview toolkit...</p>
              </div>
            </div>
          </Card>
        ) : (
          <ToolkitAccordion data={toolkitData} />
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            This toolkit is designed to give you confidence in every aspect of your job search. Practice with these materials to improve your interview performance and networking effectiveness.
          </p>
        </div>
      </div>
    </div>
  );
}