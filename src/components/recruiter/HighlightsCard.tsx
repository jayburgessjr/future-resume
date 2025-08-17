import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, RefreshCw, CheckCircle, FileText } from 'lucide-react';

interface HighlightsCardProps {
  highlights: string[];
  isGenerating: boolean;
  onRefresh: () => void;
  currentSettings: {
    mode: string;
    voice: string;
  };
}

export function HighlightsCard({ highlights, isGenerating, onRefresh, currentSettings }: HighlightsCardProps) {
  const { toast } = useToast();

  const handleCopyAll = async () => {
    try {
      const formattedText = highlights.map((highlight, index) => 
        `${index + 1}. ${highlight}`
      ).join('\n\n');
      
      await navigator.clipboard.writeText(formattedText);
      toast({
        title: "Copied!",
        description: "All highlights copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const formattedText = highlights.map((highlight, index) => 
      `${index + 1}. ${highlight}`
    ).join('\n\n');
    
    const blob = new Blob([`RECRUITER HIGHLIGHTS\n\nGenerated for ${currentSettings.mode} • ${currentSettings.voice}\n\n${formattedText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recruiter-highlights.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Highlights saved as recruiter-highlights.txt",
    });
  };

  const truncateText = (text: string, maxLength: number = 85) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (isGenerating) {
    return (
      <Card className="card-elegant">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-4 animate-bounce"></div>
            <p className="text-muted-foreground">Generating recruiter highlights...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!highlights || highlights.length === 0) {
    return (
      <Card className="card-elegant">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Highlights Generated</h3>
          <p className="text-muted-foreground mb-4">
            Generate a resume to create recruiter-focused highlights
          </p>
          <Button onClick={onRefresh} variant="outline">
            Generate Highlights
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-elegant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold mb-2">Recruiter Highlights</h3>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {currentSettings.mode}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentSettings.voice}
              </Badge>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Re-spin
            </Button>
            <Button onClick={handleCopyAll} variant="secondary" size="sm">
              <Copy className="w-4 h-4 mr-1" />
              Copy All
            </Button>
            <Button onClick={handleDownload} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Highlights Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {highlights.map((highlight, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-help">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">
                        {truncateText(highlight)}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="max-w-xs p-3 text-sm"
                  align="start"
                >
                  {highlight}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          These bullets are optimized for recruiter scanning and ATS parsing
        </div>
      </div>
    </Card>
  );
}