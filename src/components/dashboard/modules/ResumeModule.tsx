"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { ResumePreview } from "@/components/common/ResumePreview";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useAppDataStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

export const ResumeModule = () => {
  const {
    inputs,
    outputs,
    status,
    generationProgress,
    updateInputs,
    generateResume,
  } = useAppDataStore();
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      toast({
        title: "Missing information",
        description: "Add your current resume and a complete job description first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateResume();
      toast({
        title: "Resume optimized",
        description: "Your targeted résumé is ready for review.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  }, [generateResume, inputs.jobText, inputs.resumeText, toast]);

  const resumeWordCount = (inputs.resumeText.match(/\S+/g) || []).length;
  const jobWordCount = (inputs.jobText.match(/\S+/g) || []).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Inputs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste the source résumé and target job description. These power every module.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="resume-input">Current résumé</Label>
              <Badge variant="outline">{resumeWordCount} words</Badge>
            </div>
            <Textarea
              id="resume-input"
              value={inputs.resumeText}
              onChange={(event) => updateInputs({ resumeText: event.target.value })}
              placeholder="Paste your current résumé content here..."
              className="min-h-[180px]"
            />
            <p className="text-xs text-muted-foreground">
              Aim for 50+ words so the AI has enough context to transform it.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="job-input">Target job description</Label>
              <Badge variant="outline">{jobWordCount} words</Badge>
            </div>
            <Textarea
              id="job-input"
              value={inputs.jobText}
              onChange={(event) => updateInputs({ jobText: event.target.value })}
              placeholder="Paste the full job description. Include responsibilities, requirements, and company details."
              className="min-h-[180px]"
            />
            <p className="text-xs text-muted-foreground">
              The richer the job description, the better the alignment and keyword matching.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={status.loading}
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {status.loading ? "Generating…" : "Generate optimized résumé"}
          </Button>

          {status.loading && (
            <ProgressIndicator
              phases={generationProgress.phases.map((phase) => ({
                ...phase,
                estimatedDuration: 15,
              }))}
              currentPhase={generationProgress.phase}
              totalProgress={generationProgress.progress}
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">AI résumé preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review, copy, or export the job-aligned version. Word count capped at 550.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResumePreview />
          {!status.loading && outputs?.resume && (
            <ExportBar content={outputs.resume} filename="optimized-resume" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
