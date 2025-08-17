import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppDataStore } from '@/stores/appData';
import { Loader2, Sparkles } from 'lucide-react';

interface CoverLetterFormProps {
  onGenerate: (data: { resumeContent: string; jobDescription: string; companySignal?: string }) => void;
  isGenerating: boolean;
  initialResumeContent?: string;
  initialJobDescription?: string;
  initialCompanySignal?: string;
}

export function CoverLetterForm({ 
  onGenerate, 
  isGenerating, 
  initialResumeContent = '',
  initialJobDescription = '',
  initialCompanySignal = ''
}: CoverLetterFormProps) {
  const [resumeContent, setResumeContent] = useState(initialResumeContent);
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [companySignal, setCompanySignal] = useState(initialCompanySignal);
  const { settings } = useAppDataStore();

  useEffect(() => {
    setResumeContent(initialResumeContent);
    setJobDescription(initialJobDescription);
    setCompanySignal(initialCompanySignal);
  }, [initialResumeContent, initialJobDescription, initialCompanySignal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeContent.trim() && jobDescription.trim()) {
      onGenerate({
        resumeContent: resumeContent.trim(),
        jobDescription: jobDescription.trim(),
        companySignal: companySignal.trim() || undefined
      });
    }
  };

  const isValid = resumeContent.trim().length > 50 && jobDescription.trim().length > 50;

  return (
    <Card className="card-elegant">
      <div className="space-y-6">
        {/* Settings Display */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {settings.mode}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {settings.voice}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {settings.format}
          </Badge>
          {settings.proofread && (
            <Badge variant="outline" className="text-xs">
              proofread
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Content */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-sm font-medium">
              Your Resume Content
            </Label>
            <Textarea
              id="resume"
              placeholder="Paste your current resume content here..."
              value={resumeContent}
              onChange={(e) => setResumeContent(e.target.value)}
              className="min-h-32 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              {resumeContent.length} characters (minimum 50)
            </p>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="job" className="text-sm font-medium">
              Job Description
            </Label>
            <Textarea
              id="job"
              placeholder="Paste the job posting here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-32 resize-none"
              required
            />
            <p className="text-xs text-muted-foreground">
              {jobDescription.length} characters (minimum 50)
            </p>
          </div>

          {/* Company Signal (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="signal" className="text-sm font-medium">
              Company Signal <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="signal"
              placeholder="e.g., 'I'm excited about your company's commitment to sustainability and innovation in the renewable energy sector...'"
              value={companySignal}
              onChange={(e) => setCompanySignal(e.target.value)}
              className="min-h-20 resize-none"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Personal hook for the opening paragraph ({companySignal.length}/100)
            </p>
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={!isValid || isGenerating}
            className="w-full btn-hero"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}