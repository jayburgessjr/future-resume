import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

interface ReviewBarProps {
  settings: {
    mode: string;
    voice: string;
    format: string;
  };
}

export const ReviewBar = ({ settings }: ReviewBarProps) => {
  return (
    <div className="border-b border-border/30 bg-muted/30">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-3 text-sm">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Settings:</span>
          <Badge variant="outline" className="text-xs">
            {settings.mode}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {settings.voice}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {settings.format}
          </Badge>
        </div>
      </div>
    </div>
  );
};