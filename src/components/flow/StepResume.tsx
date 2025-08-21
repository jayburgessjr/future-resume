"use client";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, AlertCircle } from "lucide-react";
import { useAppDataStore } from "@/stores";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useToast } from "@/hooks/use-toast";
import { ResumePreview } from "@/components/common/ResumePreview";

export const StepResume = () => {
  const [searchParams] = useSearchParams();
  const {
    settings,
    inputs,
    outputs,
    updateSettings,
    updateInputs,
    generateResume,
    loading
  } = useAppDataStore();
  const { toast } = useToast();

  // Handle autostart generation when component mounts
  useEffect(() => {
    const autostart = searchParams.get('autostart');
    const hasInputs = inputs.resumeText?.trim() && inputs.jobText?.trim();
    const hasOutput = outputs?.resume?.trim();
    
    if (autostart === '1' && hasInputs && !hasOutput && !loading) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        generateResume();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, inputs.resumeText, inputs.jobText, outputs?.resume, loading, generateResume]);
  const resume = outputs?.resume ?? "";
  const words = (resume.trim().match(/\S+/g) || []).length;
  const canContinue = words > 0 && words <= 550;

  const handleGenerate = async () => {
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      toast({
        title: "Missing Inputs",
        description: "Please provide both resume content and job description.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateResume();
      toast({
        title: "Resume Generated!",
        description: "Your targeted resume has been created.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 p-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Generate Resume</h2>
            <p className="text-muted-foreground">Create an ATS-optimized resume for your target job</p>
          </div>
        </div>

        {/* Settings */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Resume Mode</Label>
                <Select value={settings.mode} onValueChange={(value) => updateSettings({ mode: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise (≤350 words)</SelectItem>
                    <SelectItem value="detailed">Detailed (≤550 words)</SelectItem>
                    <SelectItem value="executive">Executive (≤450 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice">Voice Style</Label>
                <Select value={settings.voice} onValueChange={(value) => updateSettings({ voice: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first-person">First Person</SelectItem>
                    <SelectItem value="third-person">Third Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Include Skills Table</Label>
                <p className="text-xs text-muted-foreground">Add structured skills section</p>
              </div>
              <Switch
                checked={settings.includeTable}
                onCheckedChange={(checked) => updateSettings({ includeTable: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resume Input */}
        <div className="space-y-2">
          <Label htmlFor="resume">Current Resume Content</Label>
          <Textarea
            id="resume"
            placeholder="Paste your current resume content here..."
            value={inputs.resumeText}
            onChange={(e) => updateInputs({ resumeText: e.target.value })}
            className="min-h-[200px]"
          />
          <p className="text-sm text-muted-foreground">
            {inputs.resumeText.length} characters (minimum 50 required)
          </p>
        </div>

        {/* Job Description Input */}
        <div className="space-y-2">
          <Label htmlFor="job">Target Job Description</Label>
          <Textarea
            id="job"
            placeholder="Paste the complete job description here..."
            value={inputs.jobText}
            onChange={(e) => updateInputs({ jobText: e.target.value })}
            className="min-h-[200px]"
          />
          <p className="text-sm text-muted-foreground">
            {inputs.jobText.length} characters (minimum 50 required)
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={async () => {
            await handleGenerate();
          }}
          disabled={loading || !inputs.resumeText.trim() || !inputs.jobText.trim()}
          className="w-full bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-transform"
          size="lg"
        >
          {loading ? "Generating…" : "Generate Resume"}
          <Sparkles className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resume Preview</h3>
          {resume && (
            <div className="flex items-center gap-2">
              <Badge variant={canContinue ? "secondary" : "destructive"}>
                {words}/550 words
              </Badge>
              {!canContinue && (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
            </div>
          )}
        </div>
        {!canContinue && words > 550 && (
          <p className="text-sm mt-2" style={{color:'#FF851B'}}>Over 550 words — trim to continue.</p>
        )}

        <Card className="bg-muted/30">
          <CardContent className="p-6 space-y-4">
            <ResumePreview />
            {!loading && resume.trim() && (
              <ExportBar content={resume} filename="targeted-resume" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
