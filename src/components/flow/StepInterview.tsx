import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sparkles, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useAppDataStore } from "@/stores/appData";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useToast } from "@/hooks/use-toast";

export const StepInterview = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
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
        title: "Interview Toolkit Generated!",
        description: "Your interview preparation materials are ready.",
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

  const handleCopyQuestion = async (question: string, index: number) => {
    try {
      await navigator.clipboard.writeText(question);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied!",
        description: "Question copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const followUpWordCount = outputs?.toolkit?.followUpEmail ? getWordCount(outputs.toolkit.followUpEmail) : 0;
  const isFollowUpOverLimit = outputs?.toolkit?.followUpEmail ? isOverLimit(outputs.toolkit.followUpEmail, 200) : false;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generate Interview Toolkit</h2>
          <p className="text-muted-foreground">Complete interview preparation with questions and follow-up template</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Instructions & Generate */}
        <div className="space-y-4">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">What we'll create:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Role-specific interview questions to practice</li>
                <li>• Skill gap analysis and improvement areas</li>
                <li>• Professional follow-up email template</li>
                <li>• Strategic talking points for each question</li>
                <li>• Complete interview preparation roadmap</li>
              </ul>
            </CardContent>
          </Card>

          {!outputs?.toolkit && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !outputs?.highlights?.length}
              className="w-full bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-transform"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Interview Toolkit"}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          )}

          {outputs?.toolkit && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Regenerating..." : "Regenerate Toolkit"}
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interview Toolkit Preview</h3>
          
          {outputs?.toolkit ? (
            <div className="space-y-4">
              {/* Interview Questions */}
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Interview Questions
                    <Badge variant="secondary">
                      {outputs.toolkit.questions?.length || 0} questions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {outputs.toolkit.questions?.map((question, index) => (
                    <div key={index} className="group relative bg-background rounded-lg p-3 border border-border/50">
                      <p className="text-sm pr-8">
                        {question}
                      </p>
                      <button
                        onClick={() => handleCopyQuestion(question, index)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent/10 rounded"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="w-3 h-3 text-primary" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No questions generated</p>}
                </CardContent>
              </Card>

              {/* Skill Gaps */}
              {outputs.toolkit.skillGaps?.length && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-base">Areas for Improvement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {outputs.toolkit.skillGaps.map((gap, index) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-2">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up Email */}
              {outputs.toolkit.followUpEmail && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      Follow-up Email Template
                      <div className="flex items-center gap-2">
                        <Badge variant={isFollowUpOverLimit ? "destructive" : "secondary"}>
                          {followUpWordCount}/200 words
                        </Badge>
                        {isFollowUpOverLimit && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-background rounded-lg p-3 max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {outputs.toolkit.followUpEmail}
                      </pre>
                    </div>
                    <ExportBar 
                      content={outputs.toolkit.followUpEmail}
                      filename="follow-up-email"
                      showWordCount={false}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {outputs?.highlights?.length 
                        ? "Generate your interview toolkit to see the preview"
                        : "Complete the previous steps first"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};