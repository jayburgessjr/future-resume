"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useAppDataStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { Copy, FilePenLine, Sparkles } from "lucide-react";

export const CoverLetterModule = () => {
  const {
    inputs,
    outputs,
    status,
    updateInputs,
    generateResume,
  } = useAppDataStore();
  const { toast } = useToast();

  const coverLetter = outputs?.coverLetter ?? "";
  const [draft, setDraft] = useState(coverLetter);

  useEffect(() => {
    setDraft(coverLetter);
  }, [coverLetter]);

  const coverLetterWordCount = useMemo(
    () => (draft.match(/\S+/g) || []).length,
    [draft]
  );

  const handleGenerate = async () => {
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      toast({
        title: "Missing information",
        description: "Add the resume content and job description so we can tailor the letter.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateResume();
      toast({
        title: "Cover letter updated",
        description: "Fresh copy ready to personalize for outreach",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUseOptimizedResume = () => {
    if (!outputs?.resume) {
      toast({
        title: "No AI résumé yet",
        description: "Generate an optimized résumé first, then reuse it here.",
      });
      return;
    }
    updateInputs({ resumeText: outputs.resume });
    toast({
      title: "Resume copied",
      description: "Using the optimized résumé as the cover-letter foundation.",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Source material</CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste the resume version and job description you want referenced.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseOptimizedResume}
              disabled={!outputs?.resume}
            >
              <Copy className="mr-2 h-4 w-4" />
              Use optimized résumé
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FilePenLine className="h-3 w-3" />
              {outputs?.resume ? "AI version available" : "Awaiting AI version"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-resume">Résumé to reference</Label>
            <Textarea
              id="cover-resume"
              value={inputs.resumeText}
              onChange={(event) => updateInputs({ resumeText: event.target.value })}
              className="min-h-[180px]"
              placeholder="Paste the resume copy this letter should follow."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-job">Job description</Label>
            <Textarea
              id="cover-job"
              value={inputs.jobText}
              onChange={(event) => updateInputs({ jobText: event.target.value })}
              className="min-h-[180px]"
              placeholder="Add the target job description so the letter hits their priorities."
            />
          </div>

          <Button onClick={handleGenerate} disabled={status.loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {status.loading ? "Generating…" : "Generate cover letter"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-semibold">Cover letter draft</CardTitle>
          <p className="text-sm text-muted-foreground">
            Editable copy tailored to the job; capped at 250 words for quick scanning.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{coverLetter ? "Ready for a personal touch" : "Generate to view the draft"}</span>
            <Badge variant={coverLetterWordCount > 250 ? "destructive" : "secondary"}>
              {coverLetterWordCount}/250 words
            </Badge>
          </div>

          <div className="rounded-lg border border-border/50 bg-background p-4 min-h-[280px]">
            {coverLetter ? (
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="h-full border-none p-0 focus-visible:ring-0"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Once generated, the letter will appear here for quick edits before sending.
              </p>
            )}
          </div>

          {coverLetter && <ExportBar content={draft} filename="cover-letter" />}
        </CardContent>
      </Card>
    </div>
  );
};
