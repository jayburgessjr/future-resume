import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

interface ResumePreviewProps {
  resume: string;
  inputs: { resumeText: string; jobText: string };
  loading: boolean;
}

export const ResumePreview = ({ resume, inputs, loading }: ResumePreviewProps) => {
  if (loading) {
    return (
      <div className="space-y-3 min-h-[400px]">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (resume?.trim()) {
    return (
      <div className="space-y-4">
        <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
            {resume}
          </pre>
        </div>
      </div>
    );
  }

  if (inputs.resumeText && inputs.jobText) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            Ready to generate. Click Generate to see preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">
          Add your resume & job description to begin.
        </p>
      </div>
    </div>
  );
};
