import { useState } from 'react';
import { CoverLetterForm } from '@/components/cover-letter/CoverLetterForm';
import { CoverLetterPreview } from '@/components/cover-letter/CoverLetterPreview';
import { generateResumeFlow } from '@/lib/resumeService';
import { useAppSettingsStore } from '@/stores/appSettings';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CoverLetterPage() {
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { settings } = useAppSettingsStore();
  const { toast } = useToast();

  const handleGenerate = async (data: { 
    resumeContent: string; 
    jobDescription: string; 
    companySignal?: string;
  }) => {
    setIsGenerating(true);
    try {
      const result = await generateResumeFlow({
        ...settings,
        resumeContent: data.resumeContent,
        jobDescription: data.jobDescription,
        manualEntry: data.companySignal,
      });

      setCoverLetter(result.coverLetter);
      
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
    } finally {
      setIsGenerating(false);
    }
  };

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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <CoverLetterForm 
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <CoverLetterPreview 
              content={coverLetter}
              isGenerating={isGenerating}
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