"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDataStore } from "@/stores";
import { useGeneratedResume } from "@/hooks/useGeneratedResume";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";

const ResumePreviewSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-4">
      <div className="animate-pulse">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
    
    <div className="space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2 mt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="space-y-2 mt-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  </div>
);

const EmptyState = ({ hasInputs }: { hasInputs: boolean }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <FileText className="w-8 h-8 text-muted-foreground" />
    </div>
    {hasInputs ? (
      <>
        <h3 className="text-lg font-medium text-foreground mb-2">Ready to Generate</h3>
        <p className="text-sm text-muted-foreground">
          Your resume content and job description are ready. Click <strong>Generate Resume</strong> to create your targeted resume.
        </p>
      </>
    ) : (
      <>
        <h3 className="text-lg font-medium text-foreground mb-2">Resume Preview</h3>
        <p className="text-sm text-muted-foreground">
          Add your resume content and job description to see the AI-optimized preview here.
        </p>
      </>
    )}
  </div>
);

export const ResumePreview = () => {
  const { inputs, status, outputs, generationProgress } = useAppDataStore();
  const loading = status.loading;
  const { generated } = useGeneratedResume();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-pulse">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">
            {generationProgress.phase || "Generating resume..."}
          </span>
        </div>
        <ResumePreviewSkeleton />
      </div>
    );
  }

  const txt = generated.trim();
  if (txt) {
    const wordCount = (txt.match(/\S+/g) || []).length;
    const isOverLimit = wordCount > 550;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">Generated Successfully</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            isOverLimit 
              ? 'bg-destructive/10 text-destructive' 
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {wordCount}/550 words
          </span>
        </div>
        
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="bg-background/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {txt}
              </pre>
            </div>
          </CardContent>
        </Card>
        
        {isOverLimit && (
          <p className="text-xs text-destructive">
            ⚠️ Resume exceeds 550 words. Consider making it more concise for better ATS compatibility.
          </p>
        )}
      </div>
    );
  }

  const hasInputs = !!(inputs.resumeText?.trim() && inputs.jobText?.trim());
  return <EmptyState hasInputs={hasInputs} />;
};
