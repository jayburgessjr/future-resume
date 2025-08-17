import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Edit3, Save, X } from 'lucide-react';

interface CoverLetterPreviewProps {
  content: string;
  isGenerating: boolean;
}

export function CoverLetterPreview({ content, isGenerating }: CoverLetterPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { toast } = useToast();

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const isOverLimit = wordCount > 250;
  const isNearLimit = wordCount >= 230;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard",
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
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Cover letter saved as cover-letter.txt",
    });
  };

  const handleSaveEdit = () => {
    // In a real app, you'd update the content in the parent component
    setIsEditing(false);
    toast({
      title: "Saved",
      description: "Cover letter updated",
    });
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  if (isGenerating) {
    return (
      <Card className="card-elegant">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-4 animate-bounce"></div>
            <p className="text-muted-foreground">Crafting your cover letter...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="card-elegant">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <Edit3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
          <p className="text-muted-foreground">
            Fill out the form to create your personalized cover letter
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-elegant">
      <div className="space-y-4">
        {/* Header with word count */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cover Letter Preview</h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOverLimit ? "destructive" : isNearLimit ? "outline" : "secondary"}
              className="text-xs"
            >
              {wordCount}/250 words
            </Badge>
          </div>
        </div>

        {/* Warning for word limit */}
        {isNearLimit && (
          <div className={`p-3 rounded-lg text-sm ${
            isOverLimit 
              ? "bg-destructive/10 text-destructive border border-destructive/20" 
              : "bg-accent/10 text-accent-foreground border border-accent/20"
          }`}>
            {isOverLimit 
              ? "⚠️ Cover letter exceeds 250-word limit. Consider shortening for better impact."
              : "📝 Approaching 250-word limit. Review for conciseness."
            }
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-48 font-mono text-sm"
                placeholder="Edit your cover letter..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} size="sm" variant="default">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancelEdit} size="sm" variant="outline">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none whitespace-pre-wrap p-4 bg-muted/30 rounded-lg border border-border text-foreground leading-relaxed"
            >
              {content}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Button onClick={handleCopy} variant="secondary" size="sm">
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button onClick={handleDownload} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}