import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface UpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  title?: string;
  description?: string;
}

const featureInfo = {
  'unlimited_resumes': {
    title: 'Unlimited Resumes',
    description: 'Create as many targeted resumes as you need for different positions.',
    icon: <Zap className="w-5 h-5" />
  },
  'version_history': {
    title: 'Version History',
    description: 'Track changes and revert to previous versions of your resumes.',
    icon: <Star className="w-5 h-5" />
  },
  'interview_toolkit': {
    title: 'Interview Toolkit',
    description: 'Get personalized interview questions and preparation materials.',
    icon: <Crown className="w-5 h-5" />
  },
  'export_formats': {
    title: 'Advanced Export Formats',
    description: 'Export to PDF, Word, and other professional formats.',
    icon: <ArrowRight className="w-5 h-5" />
  },
  'priority_support': {
    title: 'Priority Support',
    description: 'Get faster response times and dedicated customer support.',
    icon: <Crown className="w-5 h-5" />
  }
};

export const UpsellModal = ({ 
  open, 
  onOpenChange, 
  feature, 
  title, 
  description 
}: UpsellModalProps) => {
  const info = featureInfo[feature as keyof typeof featureInfo] || {
    title: title || 'Pro Feature',
    description: description || 'This feature is available with Resume Builder Pro.',
    icon: <Crown className="w-5 h-5" />
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-center">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white mb-3">
              {info.title}
            </Badge>
            <p className="text-muted-foreground">
              {info.description}
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" />
              What you'll get with Pro:
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Unlimited resumes and toolkits
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Complete interview preparation toolkit
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Version history and advanced exports
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                Priority customer support
              </li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <span className="line-through">$29/month</span>
            <span className="text-lg font-bold text-foreground ml-2">$20/month</span>
            <Badge variant="secondary" className="ml-2">33% off</Badge>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button asChild className="w-full bg-gradient-to-r from-primary to-accent text-white">
            <Link to="/pricing">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};