import { CoverLetterForm } from '@/components/cover-letter/CoverLetterForm';
import { CoverLetterPreview } from '@/components/cover-letter/CoverLetterPreview';
import { ExportBar } from '@/components/export/ExportBar';
import { CompanySignalPanel } from '@/components/company/CompanySignalPanel';
import { useAppDataStore } from '@/stores/appData';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CoverLetterPage() {
  const { 
    outputs, 
    status, 
    inputs,
    settings,
    updateInputs, 
    runGeneration,
    getWordCount,
    isOverLimit
  } = useAppDataStore();
  const { toast } = useToast();

  const handleGenerate = async (data: { 
    resumeContent: string; 
    jobDescription: string; 
    companySignal?: string;
  }) => {
    try {
      // Update inputs in store
      updateInputs({
        resumeText: data.resumeContent,
        jobText: data.jobDescription,
        companySignal: data.companySignal,
      });

      // Run generation
      await runGeneration();
      
      toast({
        title: "Cover Letter Generated!",
        description: "Your personalized cover letter is ready",
      });
    } catch (error) {
      console.error('Cover letter generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. Check your inputs and connection.",
        variant: "destructive",
      });
    }
  };

  const handleInsertSignal = async () => {
    if (!inputs.companySignal) {
      toast({
        title: "No Company Signal",
        description: "Please add a company signal first",
        variant: "destructive",
      });
      return;
    }

    try {
      await runGeneration();
      toast({
        title: "Cover Letter Updated!",
        description: "Company signal has been woven into your cover letter",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Please check your inputs and try again",
        variant: "destructive",
      });
    }
  };

  const coverLetter = outputs?.coverLetter || '';
  const wordCount = getWordCount(coverLetter);
  const isOverWordLimit = isOverLimit(coverLetter, 250);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-7xl mx-auto px-4 py-8">
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
          
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gradient mb-3">
              Cover Letter Builder
            </h1>
            <p className="text-lg text-muted-foreground">
              Generate a personalized, ATS-friendly cover letter that complements your resume
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <CoverLetterForm 
              onGenerate={handleGenerate}
              isGenerating={status.loading}
              initialResumeContent={inputs.resumeText}
              initialJobDescription={inputs.jobText}
              initialCompanySignal={inputs.companySignal}
            />
          </div>

          {/* Preview */}
          <div className="lg:col-span-1 space-y-6">
            <CoverLetterPreview 
              content={coverLetter}
              isGenerating={status.loading}
              wordCount={wordCount}
              isOverLimit={isOverWordLimit}
            />
            
            {/* Export Bar */}
            {coverLetter && (
              <ExportBar 
                content={coverLetter}
                title="Cover Letter"
                metadata={{
                  generatedAt: new Date(status.lastGenerated || Date.now()),
                  settings,
                  wordCount
                }}
                showWordCount={false}
              />
            )}
          </div>

          {/* Company Signal Panel */}
          <div className="lg:col-span-1">
            <CompanySignalPanel 
              showInsertButton={true}
              onInsert={handleInsertSignal}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Cover letters are limited to 250 words for optimal impact. Our AI ensures every word counts towards landing your interview.
          </p>
        </div>
      </div>
    </div>
  );
}