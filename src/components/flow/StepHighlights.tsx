import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Sparkles, Copy, CheckCircle } from "lucide-react";
import { useAppDataStore } from "@/stores/appData";
import { useToast } from "@/hooks/use-toast";

export const StepHighlights = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { 
    outputs, 
    runGeneration 
  } = useAppDataStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await runGeneration();
      toast({
        title: "Recruiter Highlights Generated!",
        description: "Your key talking points have been created.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHighlight = async (highlight: string, index: number) => {
    try {
      await navigator.clipboard.writeText(highlight);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied!",
        description: "Highlight copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generate Recruiter Highlights</h2>
          <p className="text-muted-foreground">Create compelling talking points for recruiters and networking</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Instructions */}
        <div className="space-y-4">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">What we'll create:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 3-5 key accomplishments tailored to the role</li>
                <li>• Quantified achievements with metrics</li>
                <li>• Skills alignment with job requirements</li>
                <li>• Value proposition statements</li>
                <li>• Ready-to-use talking points for interviews</li>
              </ul>
            </CardContent>
          </Card>

          {!outputs?.highlights?.length && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !outputs?.coverLetter}
              className="w-full bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-transform"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Highlights"}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          )}

          {outputs?.highlights?.length && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Regenerating..." : "Regenerate Highlights"}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recruiter Highlights</h3>
            {outputs?.highlights?.length && (
              <Badge variant="secondary">
                {outputs.highlights.length} highlights
              </Badge>
            )}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              {outputs?.highlights?.length ? (
                <div className="space-y-3">
                  {outputs.highlights.map((highlight, index) => (
                    <div key={index} className="group relative bg-background rounded-lg p-4 border border-border/50">
                      <p className="text-sm leading-relaxed pr-8">
                        {highlight}
                      </p>
                      <button
                        onClick={() => handleCopyHighlight(highlight, index)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent/10 rounded"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {outputs?.coverLetter 
                        ? "Generate your highlights to see the preview"
                        : "Complete the previous steps first"
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};