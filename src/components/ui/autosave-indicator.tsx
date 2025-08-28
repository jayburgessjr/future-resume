import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
  onForceSave?: () => void;
  className?: string;
}

export const AutosaveIndicator = ({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  onForceSave,
  className = ""
}: AutosaveIndicatorProps) => {
  const getStatus = () => {
    if (error) {
      return {
        icon: AlertCircle,
        text: "Save failed",
        variant: "destructive" as const,
        color: "text-destructive"
      };
    }
    
    if (isSaving) {
      return {
        icon: Loader2,
        text: "Saving...",
        variant: "secondary" as const,
        color: "text-muted-foreground",
        animate: true
      };
    }
    
    if (hasUnsavedChanges) {
      return {
        icon: Clock,
        text: "Unsaved changes",
        variant: "outline" as const,
        color: "text-warning"
      };
    }
    
    if (lastSaved) {
      return {
        icon: CheckCircle,
        text: `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`,
        variant: "outline" as const,
        color: "text-success"
      };
    }
    
    return {
      icon: Save,
      text: "Not saved",
      variant: "outline" as const,
      color: "text-muted-foreground"
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={status.variant}
        className={`flex items-center gap-1.5 px-3 py-1 ${status.color}`}
      >
        <Icon 
          className={`w-3 h-3 ${status.animate ? 'animate-spin' : ''}`} 
        />
        <span className="text-xs font-medium">
          {status.text}
        </span>
      </Badge>
      
      {(hasUnsavedChanges || error) && onForceSave && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onForceSave}
          disabled={isSaving}
          className="h-7 px-2 text-xs hover:bg-accent/50"
        >
          <Save className="w-3 h-3 mr-1" />
          Save now
        </Button>
      )}
    </div>
  );
};