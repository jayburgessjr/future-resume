import { HighlightsCard } from '@/components/recruiter/HighlightsCard';
import { ExportBar } from '@/components/export/ExportBar';
import { useAppDataStore } from '@/stores/appData';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RecruiterHighlightsPage() {
  const { 
    outputs, 
    status, 
    runGeneration,
    isReadyToGenerate
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
        title: "Highlights Generated!",
        description: "Your recruiter highlights are ready",
      });
    } catch (error) {
      console.error('Highlights generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. Check your connection.",
        variant: "destructive",
      });
    }
  };

  const highlights = outputs?.highlights || [];
  const hasInputs = isReadyToGenerate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-5xl mx-auto px-4 py-8">
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-accent-foreground" />
              </div>
              <h1 className="text-4xl font-bold text-gradient">
                Recruiter Highlights
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Five powerful bullets that make recruiters stop scrolling and start calling
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="lg:col-span-1">
            <Card className="card-elegant">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">What are Recruiter Highlights?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Strategic bullet points that capture attention in the first 6 seconds of resume scanning.
                  </p>
                  <p>
                    Each highlight is crafted to demonstrate measurable impact and relevant skills for your target role.
                  </p>
                  <p>
                    Perfect for LinkedIn summaries, email signatures, or networking conversations.
                  </p>
                </div>
                
                {!hasInputs && (
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-sm text-accent-foreground">
                      💡 Add resume and job description in the builder first
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Highlights */}
          <div className="lg:col-span-2 space-y-6">
            <HighlightsCard
              highlights={highlights}
              isGenerating={status.loading}
              onRefresh={handleGenerate}
              currentSettings={{
                mode: useAppDataStore.getState().settings.mode,
                voice: useAppDataStore.getState().settings.voice,
              }}
            />
            
            {/* Export Bar */}
            {highlights.length > 0 && (
              <ExportBar 
                content={highlights.map((h, i) => `${i + 1}. ${h}`).join('\n\n')}
                title="Recruiter Highlights"
                metadata={{
                  generatedAt: status.lastGenerated,
                  settings: useAppDataStore.getState().settings,
                }}
                showWordCount={false}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            These highlights are designed to pass ATS screening while capturing human attention. Use them strategically across your job search materials.
          </p>
        </div>
      </div>
    </div>
  );
}