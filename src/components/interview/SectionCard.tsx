import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink } from 'lucide-react';

interface SectionCardProps {
  title: string;
  content: string | string[];
  type?: 'text' | 'list' | 'email' | 'kpi' | 'links';
  wordLimit?: number;
  badge?: string;
}

export function SectionCard({ title, content, type = 'text', wordLimit, badge }: SectionCardProps) {
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${title} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const getFormattedContent = () => {
    if (!content) return '';
    
    if (Array.isArray(content)) {
      return content.join('\n\n');
    }
    return content;
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const renderContent = () => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No content generated yet</p>
        </div>
      );
    }

    switch (type) {
      case 'list':
        if (Array.isArray(content)) {
          return (
            <div className="space-y-3">
              {content.map((item, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          );
        }
        break;

      case 'email':
        const wordCount = getWordCount(content as string);
        const isOverLimit = wordLimit && wordCount > wordLimit;
        return (
          <div className="space-y-3">
            {wordLimit && (
              <div className="flex justify-between items-center">
                <Badge variant={isOverLimit ? "destructive" : "secondary"} className="text-xs">
                  {wordCount}/{wordLimit} words
                </Badge>
              </div>
            )}
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {content}
              </pre>
            </div>
          </div>
        );

      case 'kpi':
        return (
          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 font-mono text-sm">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {content}
            </pre>
          </div>
        );

      case 'links':
        if (Array.isArray(content)) {
          return (
            <div className="space-y-3">
              {content.map((item, index) => {
                // Check if it's a URL or just text
                const isUrl = item.includes('http') || item.includes('www.');
                return (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
                    <p className="text-sm leading-relaxed flex-1">{item}</p>
                    {isUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(item, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
        break;

      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {content}
            </pre>
          </div>
        );
    }
  };

  return (
    <Card className="card-elegant">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            {badge && (
              <Badge variant="outline" className="text-xs">
                {badge}
              </Badge>
            )}
          </div>
          <Button
            onClick={() => handleCopy(getFormattedContent())}
            variant="ghost"
            size="sm"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Card>
  );
}