import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  RotateCcw, 
  TestTube, 
  Download,
  AlertTriangle,
  CheckCircle 
} from "lucide-react";
import { loadDemoData, resetAllData, exportAppState, QA_UTILITIES } from "@/lib/demoData";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const QAPanel = () => {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleLoadDemo = () => {
    loadDemoData();
    toast({
      title: "Demo Data Loaded",
      description: "Resume and job description filled with sample content",
    });
  };

  const handleReset = () => {
    resetAllData();
    toast({
      title: "Data Reset",
      description: "All application data has been cleared",
      variant: "destructive",
    });
  };

  const handleExportState = () => {
    const state = exportAppState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-state-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "State Exported",
      description: "Application state downloaded as JSON file",
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <TestTube className="h-4 w-4 mr-2" />
          QA Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-accent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm">QA Tools</CardTitle>
              <Badge variant="outline" className="text-xs">DEV</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          <CardDescription className="text-xs">
            Development utilities for testing and debugging
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Data Management */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Data Management</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadDemo}
                className="h-8 text-xs"
              >
                <Database className="h-3 w-3 mr-1" />
                Load Demo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset All
              </Button>
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Test Scenarios</h4>
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  QA_UTILITIES.loadLongResume();
                  toast({ title: "Long resume loaded", description: "Testing word count limits" });
                }}
                className="h-7 text-xs w-full justify-start"
              >
                <AlertTriangle className="h-3 w-3 mr-2" />
                Long Resume (600+ words)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  QA_UTILITIES.loadMinimalData();
                  toast({ title: "Minimal data loaded", description: "Testing edge cases" });
                }}
                className="h-7 text-xs w-full justify-start"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Minimal Content
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  QA_UTILITIES.loadMarketingJob();
                  toast({ title: "Marketing Manager job loaded", description: "B2B SaaS growth role with $150K budget management" });
                }}
                className="h-7 text-xs w-full justify-start"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Marketing Manager - Growth
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  QA_UTILITIES.loadCustomerServiceJob();
                  toast({ title: "Customer Service Rep loaded", description: "Technical support role with 2-hour SLA targets" });
                }}
                className="h-7 text-xs w-full justify-start"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Technical Support Rep
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  QA_UTILITIES.triggerErrorState();
                  toast({ title: "Error state triggered", description: "Testing validation" });
                }}
                className="h-7 text-xs w-full justify-start"
              >
                <AlertTriangle className="h-3 w-3 mr-2" />
                Empty Fields
              </Button>
            </div>
          </div>

          {/* Debug Tools */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Debug</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportState}
              className="h-8 text-xs w-full"
            >
              <Download className="h-3 w-3 mr-2" />
              Export App State
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};