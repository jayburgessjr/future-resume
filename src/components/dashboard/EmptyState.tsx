import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Briefcase } from "lucide-react";

interface EmptyStateProps {
  type: 'resume' | 'jobs';
  onAction: () => void;
}

export const EmptyState = ({ type, onAction }: EmptyStateProps) => {
  const config = {
    resume: {
      icon: FileText,
      title: "No Master Résumé",
      description: "Create your master résumé to get started with targeted applications.",
      actionText: "Create Master Résumé"
    },
    jobs: {
      icon: Briefcase,
      title: "No Job Descriptions",
      description: "Save job descriptions to compare against your résumé and track applications.",
      actionText: "Add Job Description"
    }
  };

  const { icon: Icon, title, description, actionText } = config[type];

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        <Button onClick={onAction} className="bg-gradient-to-r from-primary to-accent text-white">
          <Plus className="h-4 w-4 mr-2" />
          {actionText}
        </Button>
      </CardContent>
    </Card>
  );
};