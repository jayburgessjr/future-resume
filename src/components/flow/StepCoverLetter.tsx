import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Sparkles, AlertCircle } from "lucide-react";
import { useAppDataStore } from "@/stores/appData";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useToast } from "@/hooks/use-toast";

export const StepCoverLetter = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { 
    outputs, 
    runGeneration,
    getWordCount,
    isOverLimit 
  } = useAppDataStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await runGeneration();
      toast({
        title: "Cover Letter Generated!",
        description: "Your cover letter has been created.",
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

  const wordCount = outputs?.coverLetter ? getWordCount(outputs.coverLetter) : 0;
  const isOverWordLimit = outputs?.coverLetter ? isOverLimit(outputs.coverLetter, 250) : false;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generate Cover Letter</h2>
          <p className="text-muted-foreground">Create a compelling cover letter that complements your resume</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Instructions */}
        <div className="space-y-4">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">What we'll create:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Personalized opening addressing the company</li>
                <li>• Highlights of your relevant experience</li>
                <li>• Connection between your skills and job requirements</li>
                <li>• Professional closing with call-to-action</li>
                <li>• Optimized for the specific role and company culture</li>
              </ul>
            </CardContent>
          </Card>

          {!outputs?.coverLetter && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !outputs?.resume}
              className="w-full bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-transform"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          )}

          {outputs?.coverLetter && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Regenerating..." : "Regenerate Cover Letter"}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Cover Letter Preview</h3>
            {outputs?.coverLetter && (
              <div className="flex items-center gap-2">
                <Badge variant={isOverWordLimit ? "destructive" : "secondary"}>
                  {wordCount}/250 words
                </Badge>
                {isOverWordLimit && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            )}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              {outputs?.coverLetter ? (
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {outputs.coverLetter}
                    </pre>
                  </div>
                  
                  <ExportBar 
                    content={outputs.coverLetter}
                    filename="cover-letter"
                  />
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {outputs?.resume 
                        ? "Generate your cover letter to see the preview"
                        : "Complete the resume step first"
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