import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Info, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HelpTooltipProps {
  content: string;
  variant?: 'info' | 'help' | 'tip';
  side?: 'top' | 'right' | 'bottom' | 'left';
  children?: React.ReactNode;
}

export const HelpTooltip = ({ 
  content, 
  variant = 'help',
  side = 'top',
  children 
}: HelpTooltipProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'info':
        return 'text-blue-500 hover:text-blue-600';
      case 'tip':
        return 'text-amber-500 hover:text-amber-600';
      default:
        return 'text-muted-foreground hover:text-foreground';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 ${getColors()}`}
            >
              {getIcon()}
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};