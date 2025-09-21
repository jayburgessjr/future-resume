"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useAppDataStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { Copy, MessageCircle, Sparkles, Star, CheckCircle } from "lucide-react";

export const InterviewModule = () => {
  const { outputs, status, generateResume, inputs } = useAppDataStore();
  const { toast } = useToast();
  const [copiedHighlight, setCopiedHighlight] = useState<number | null>(null);
  const [copiedQuestion, setCopiedQuestion] = useState<number | null>(null);

  const highlights = outputs?.highlights ?? [];
  const toolkit = outputs?.toolkit;
  const weeklyTracker = outputs?.weeklyKPITracker ?? "";

  const handleGenerate = async () => {
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      toast({
        title: "Missing information",
        description: "Add resume and job details so we can tailor the toolkit.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateResume();
      toast({
        title: "Toolkit refreshed",
        description: "Highlights, interview prep, and follow-up are ready.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async (text: string, onSuccess: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      onSuccess();
      toast({
        title: "Copied",
        description: "Saved to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const followUpWordCount = useMemo(
    () => (toolkit?.followUpEmail ? (toolkit.followUpEmail.match(/\S+/g) || []).length : 0),
    [toolkit?.followUpEmail]
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Generate highlights & interview prep</p>
            <p className="text-sm text-muted-foreground">
              One click refreshes recruiter talking points, CARL questions, follow-up email, and KPIs.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={status.loading} className="sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            {status.loading ? "Generating…" : "Generate toolkit"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Star className="h-4 w-4" /> Recruiter highlights
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Five scan-friendly bullets that position your value quickly.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {highlights.length ? (
              highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg border border-border/40 bg-background p-3"
                >
                  <p className="text-sm leading-relaxed pr-8">{highlight}</p>
                  <button
                    onClick={() =>
                      handleCopy(highlight, () => {
                        setCopiedHighlight(index);
                        setTimeout(() => setCopiedHighlight(null), 1500);
                      })
                    }
                    className="absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent/10"
                    aria-label="Copy highlight"
                  >
                    {copiedHighlight === index ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Generate the toolkit to see curated recruiter sound bites here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="h-4 w-4" /> Interview prompts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Use these CARL/SOAR prompts to prep tight, outcome-led stories.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {toolkit?.questions?.length ? (
              toolkit.questions.map((question, index) => (
                <div
                  key={index}
                  className="group relative rounded-lg border border-border/40 bg-background p-3"
                >
                  <p className="text-sm leading-relaxed pr-8">{question}</p>
                  <button
                    onClick={() =>
                      handleCopy(question, () => {
                        setCopiedQuestion(index);
                        setTimeout(() => setCopiedQuestion(null), 1500);
                      })
                    }
                    className="absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent/10"
                    aria-label="Copy question"
                  >
                    {copiedQuestion === index ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Interview prompts populate after generating the toolkit.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">Follow-up email</CardTitle>
            <p className="text-sm text-muted-foreground">
              Send within 24 hours. Keep it ≤200 words for crisp appreciation and momentum.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {toolkit?.followUpEmail ? (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Ready-to-send copy</span>
                  <Badge variant={followUpWordCount > 200 ? "destructive" : "secondary"}>
                    {followUpWordCount}/200 words
                  </Badge>
                </div>
                <div className="rounded-lg border border-border/40 bg-background p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">{toolkit.followUpEmail}</pre>
                </div>
                <ExportBar content={toolkit.followUpEmail} filename="follow-up-email" showWordCount={false} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Generate the toolkit to unlock an interview follow-up template.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold">Skill focus & weekly cadence</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track improvement areas and keep momentum on your search.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {toolkit?.skillGaps?.length ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Skill-drift alerts</p>
                <div className="flex flex-wrap gap-2">
                  {toolkit.skillGaps.map((gap, index) => (
                    <Badge key={index} variant="outline">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Generate to see which skills the job emphasizes that the résumé underplays.
              </p>
            )}

            {weeklyTracker ? (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Weekly KPI dashboard</p>
                <div className="rounded-lg border border-border/40 bg-background p-4 text-sm leading-relaxed">
                  <pre className="whitespace-pre-wrap">{weeklyTracker}</pre>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
