import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDataStore } from '@/stores/appData';
import { Building2, ExternalLink, Calendar, Lightbulb, TrendingUp } from 'lucide-react';

export const CompanySignalStep = () => {
  const { inputs, updateInputs } = useAppDataStore();
  const [localCompanyName, setLocalCompanyName] = useState(inputs.companyName || '');
  const [localCompanySignal, setLocalCompanySignal] = useState(inputs.companySignal || '');
  const [localCompanyUrl, setLocalCompanyUrl] = useState(inputs.companyUrl || '');

  const handleInputChange = () => {
    updateInputs({
      companyName: localCompanyName,
      companySignal: localCompanySignal,
      companyUrl: localCompanyUrl,
    });
  };

  // Auto-save on any change
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleInputChange();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localCompanyName, localCompanySignal, localCompanyUrl]);

  const wordCount = localCompanySignal.split(/\s+/).filter(word => word.length > 0).length;
  const isOptimalLength = wordCount >= 10 && wordCount <= 50;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Company Intelligence</h2>
          <p className="text-muted-foreground">Add recent company news to personalize your application</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company-name" className="text-base font-medium">
            Company Name
          </Label>
          <Input
            id="company-name"
            placeholder="e.g., Acme Corporation, Google, Tesla"
            value={localCompanyName}
            onChange={(e) => setLocalCompanyName(e.target.value)}
            className="text-base"
          />
        </div>

        {/* Company Signal */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="company-signal" className="text-base font-medium">
              Recent Company News/Achievement
            </Label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>≤6 months old</span>
            </div>
          </div>
          
          <Textarea
            id="company-signal"
            placeholder="Examples:
• Recently raised $100M Series C funding
• Launched new AI-powered product suite
• Expanded operations to 15 new countries
• Won 'Best Workplace' award from Fortune
• Acquired competitor TechCorp for $2B
• IPO planned for Q2 2024"
            value={localCompanySignal}
            onChange={(e) => setLocalCompanySignal(e.target.value)}
            className="min-h-[160px] text-base resize-none"
            maxLength={300}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {localCompanySignal.length}/300 characters
            </span>
            <Badge 
              variant={isOptimalLength ? "default" : "outline"}
              className={isOptimalLength ? "bg-green-100 text-green-800 border-green-200" : ""}
            >
              {wordCount} words {isOptimalLength ? "✓ Optimal" : ""}
            </Badge>
          </div>
        </div>

        {/* Optional URL */}
        <div className="space-y-2">
          <Label htmlFor="company-url" className="text-base font-medium">
            Source URL <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="company-url"
              placeholder="https://techcrunch.com/company-news"
              value={localCompanyUrl}
              onChange={(e) => setLocalCompanyUrl(e.target.value)}
              type="url"
              className="text-base"
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
      </div>

      {/* Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Pro Tip</h4>
                <p className="text-xs text-muted-foreground">
                  Recent news shows you're genuinely interested and researched the company. Check their website, LinkedIn, or tech blogs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Impact</h4>
                <p className="text-xs text-muted-foreground">
                  This information will be used to craft a personalized opening for your cover letter.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Signal Preview */}
      {inputs.companySignal && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Current Signal:
            </div>
            <div className="text-sm">
              {inputs.companyName && (
                <div className="font-medium mb-2 text-primary">{inputs.companyName}</div>
              )}
              <p className="leading-relaxed text-foreground">
                {inputs.companySignal}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};