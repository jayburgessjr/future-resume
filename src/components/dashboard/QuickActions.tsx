import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  Zap,
  ArrowRight
} from "lucide-react";

interface QuickActionsProps {
  onCreateMasterResume: () => void;
  onAddJobDescription: () => void;
  onRunComparison: () => void;
  onGenerateTargeted: () => void;
  hasJobs: boolean;
  hasMasterResume: boolean;
}

export const QuickActions = ({ 
  onCreateMasterResume, 
  onAddJobDescription, 
  onRunComparison, 
  onGenerateTargeted,
  hasJobs,
  hasMasterResume
}: QuickActionsProps) => {
  const actions = [
    {
      title: "New Master Résumé",
      description: "Create or update your master résumé",
      icon: FileText,
      action: onCreateMasterResume,
      enabled: true,
      variant: "primary" as const
    },
    {
      title: "Add Job Description",
      description: "Save a new job posting for analysis",
      icon: Plus,
      action: onAddJobDescription,
      enabled: true,
      variant: "secondary" as const
    },
    {
      title: "Run Comparison",
      description: "Analyze gaps between your résumé and saved jobs",
      icon: TrendingUp,
      action: onRunComparison,
      enabled: hasJobs && hasMasterResume,
      variant: "secondary" as const
    },
    {
      title: "Generate Targeted Résumé",
      description: "Create a customized résumé for a specific role",
      icon: Zap,
      action: onGenerateTargeted,
      enabled: hasJobs && hasMasterResume,
      variant: "accent" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.action}
            disabled={!action.enabled}
            variant={action.enabled ? "ghost" : "ghost"}
            className={`w-full justify-start h-auto p-4 ${
              action.variant === "primary" 
                ? "bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20" 
                : action.variant === "accent"
                ? "bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 border border-accent/20"
                : "hover:bg-muted/50"
            } ${!action.enabled ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  action.variant === "primary" 
                    ? "bg-gradient-to-br from-primary to-accent text-white"
                    : action.variant === "accent"
                    ? "bg-gradient-to-br from-accent to-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              {action.enabled && (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        ))}
        
        {(!hasJobs || !hasMasterResume) && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
            💡 Create a master résumé and add job descriptions to unlock all features
          </div>
        )}
      </CardContent>
    </Card>
  );
};