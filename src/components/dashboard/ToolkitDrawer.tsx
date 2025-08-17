import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type Toolkit } from "@/stores/dashboardStore";
import { 
  FileText,
  Mail,
  Star,
  MessageSquare,
  Copy,
  Download,
  ExternalLink,
  Calendar
} from "lucide-react";

interface ToolkitDrawerProps {
  toolkit: Toolkit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendToBuilder: (toolkit: Toolkit) => void;
  onCopyAll: (toolkit: Toolkit) => void;
  onDownload: (toolkit: Toolkit) => void;
}

export const ToolkitDrawer = ({
  toolkit,
  open,
  onOpenChange,
  onSendToBuilder,
  onCopyAll,
  onDownload
}: ToolkitDrawerProps) => {
  if (!toolkit) return null;

  const outputs = toolkit.outputs || {};
  const settings = toolkit.settings || {};
  const inputs = toolkit.inputs || {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderInterviewToolkit = (interviewData: any) => {
    if (!interviewData || typeof interviewData !== 'object') {
      return <p className="text-muted-foreground">No interview toolkit generated</p>;
    }

    return (
      <div className="space-y-4">
        {Object.entries(interviewData).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl leading-tight">
                {toolkit.title}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {toolkit.job_title} at {toolkit.company}
              </SheetDescription>
            </div>
            {toolkit.favorite && (
              <Badge variant="secondary" className="shrink-0">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Favorite
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(toolkit.created_at)}</span>
          </div>

          <Separator />

          {/* Settings Overview */}
          {settings && Object.keys(settings).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.MODE && (
                <Badge variant="outline">Mode: {settings.MODE}</Badge>
              )}
              {settings.VOICE && (
                <Badge variant="outline">Voice: {settings.VOICE}</Badge>
              )}
              {settings.FORMAT && (
                <Badge variant="outline">Format: {settings.FORMAT}</Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => onSendToBuilder(toolkit)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Builder
            </Button>
            <Button
              variant="outline"
              onClick={() => onCopyAll(toolkit)}
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button
              variant="outline"
              onClick={() => onDownload(toolkit)}
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="resume" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resume" className="text-xs sm:text-sm">
                <FileText className="w-4 h-4 mr-1" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="cover-letter" className="text-xs sm:text-sm">
                <Mail className="w-4 h-4 mr-1" />
                Cover Letter
              </TabsTrigger>
              <TabsTrigger value="highlights" className="text-xs sm:text-sm">
                <Star className="w-4 h-4 mr-1" />
                Highlights
              </TabsTrigger>
              <TabsTrigger value="interview" className="text-xs sm:text-sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                Interview
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="resume" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Targeted Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {outputs.resume ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                          {outputs.resume}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No resume generated</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cover-letter" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {outputs.coverLetter ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                          {outputs.coverLetter}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No cover letter generated</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="highlights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Recruiter Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {outputs.highlights && Array.isArray(outputs.highlights) && outputs.highlights.length > 0 ? (
                      <div className="space-y-3">
                        {outputs.highlights.map((highlight: string, index: number) => (
                          <Card key={index} className="bg-muted/50">
                            <CardContent className="p-4">
                              <p className="text-sm">{highlight}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No highlights generated</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Interview Toolkit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderInterviewToolkit(outputs.interviewToolkit)}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};