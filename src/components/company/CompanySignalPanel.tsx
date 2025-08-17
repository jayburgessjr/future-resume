import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppDataStore } from '@/stores/appData';
import { useToast } from '@/hooks/use-toast';
import { Building2, ExternalLink, Sparkles, Calendar } from 'lucide-react';

interface CompanySignalPanelProps {
  showInsertButton?: boolean;
  onInsert?: () => void;
}

export function CompanySignalPanel({ showInsertButton = false, onInsert }: CompanySignalPanelProps) {
  const { inputs, updateInputs, status } = useAppDataStore();
  const { toast } = useToast();
  const [localCompanyName, setLocalCompanyName] = useState(inputs.companyName || '');
  const [localCompanySignal, setLocalCompanySignal] = useState(inputs.companySignal || '');
  const [localCompanyUrl, setLocalCompanyUrl] = useState(inputs.companyUrl || '');

  const handleSave = () => {
    updateInputs({
      companyName: localCompanyName,
      companySignal: localCompanySignal,
      companyUrl: localCompanyUrl,
    });
    
    toast({
      title: "Company Signal Saved",
      description: "Information captured for cover letter customization",
    });
  };

  const handleInsert = () => {
    handleSave();
    if (onInsert) {
      onInsert();
    }
  };

  const hasChanges = 
    localCompanyName !== inputs.companyName ||
    localCompanySignal !== inputs.companySignal ||
    localCompanyUrl !== inputs.companyUrl;

  const wordCount = localCompanySignal.split(/\s+/).filter(word => word.length > 0).length;
  const isOptimalLength = wordCount >= 10 && wordCount <= 50;

  return (
    <Card className="card-elegant sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          Company Signal
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Recent facts (≤6 months)</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company-name" className="text-sm font-medium">
            Company Name
          </Label>
          <Input
            id="company-name"
            placeholder="e.g., Acme Corporation"
            value={localCompanyName}
            onChange={(e) => setLocalCompanyName(e.target.value)}
          />
        </div>

        {/* Company Signal */}
        <div className="space-y-2">
          <Label htmlFor="company-signal" className="text-sm font-medium">
            Recent Company News/Achievement
          </Label>
          <Textarea
            id="company-signal"
            placeholder="e.g., Recently launched their new sustainability initiative, raised $50M Series B, expanded to European markets..."
            value={localCompanySignal}
            onChange={(e) => setLocalCompanySignal(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={300}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {localCompanySignal.length}/300 characters
            </span>
            <Badge 
              variant={isOptimalLength ? "secondary" : "outline"}
              className="text-xs"
            >
              {wordCount} words {isOptimalLength ? "✓" : ""}
            </Badge>
          </div>
        </div>

        {/* Optional URL */}
        <div className="space-y-2">
          <Label htmlFor="company-url" className="text-sm font-medium">
            Reference URL <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="company-url"
              placeholder="https://company.com/press-release"
              value={localCompanyUrl}
              onChange={(e) => setLocalCompanyUrl(e.target.value)}
              type="url"
            />
            {localCompanyUrl && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.open(localCompanyUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Usage Tip */}
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs text-accent-foreground">
            💡 <strong>Tip:</strong> Use recent company news to personalize your cover letter opening. 
            Examples: funding rounds, product launches, awards, expansion, partnerships.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {showInsertButton ? (
            <Button
              onClick={handleInsert}
              disabled={!localCompanySignal.trim() || status.loading}
              className="flex-1 btn-hero"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Insert into Cover Letter
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              variant={hasChanges ? "default" : "secondary"}
              className="flex-1"
              size="sm"
            >
              Save Signal
            </Button>
          )}
        </div>

        {/* Current Signal Display */}
        {inputs.companySignal && (
          <div className="pt-2 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Current Signal:
            </div>
            <div className="text-xs bg-muted/30 rounded p-2 border border-border">
              {inputs.companyName && (
                <div className="font-medium mb-1">{inputs.companyName}</div>
              )}
              <div className="leading-relaxed">
                {inputs.companySignal.slice(0, 100)}
                {inputs.companySignal.length > 100 && '...'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}