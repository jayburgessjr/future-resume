import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, AlertCircle } from "lucide-react";
import { useAppDataStore } from "@/stores/appData";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { useToast } from "@/hooks/use-toast";

export const StepResume = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { 
    settings, 
    inputs, 
    outputs, 
    updateSettings, 
    updateInputs, 
    runGeneration,
    getWordCount,
    isOverLimit 
  } = useAppDataStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputs.resumeText.trim() || !inputs.jobText.trim()) {
      toast({
        title: "Missing Inputs",
        description: "Please provide both resume content and job description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await runGeneration();
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
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = outputs?.resume ? getWordCount(outputs.resume) : 0;
  const isOverWordLimit = outputs?.resume ? isOverLimit(outputs.resume, 550) : false;

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
          onClick={handleGenerate}
          disabled={isGenerating || !inputs.resumeText.trim() || !inputs.jobText.trim()}
          className="w-full bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-transform"
          size="lg"
        >
          {isGenerating ? "Generating..." : "Generate Resume"}
          <Sparkles className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Resume Preview</h3>
          {outputs?.resume && (
            <div className="flex items-center gap-2">
              <Badge variant={isOverWordLimit ? "destructive" : "secondary"}>
                {wordCount}/550 words
              </Badge>
              {isOverWordLimit && (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
            </div>
          )}
        </div>

        <Card className="bg-muted/30">
          <CardContent className="p-6">
            {outputs?.resume ? (
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {outputs.resume}
                  </pre>
                </div>
                
                <ExportBar 
                  content={outputs.resume}
                  filename="targeted-resume"
                />
              </div>
            ) : (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    Generate your resume to see the preview
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};