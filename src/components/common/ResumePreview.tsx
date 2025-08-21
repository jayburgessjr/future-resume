"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDataStore } from "@/stores";
import { useGeneratedResume } from "@/hooks/useGeneratedResume";

const SkeletonLines = ({ lines }: { lines: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

export const ResumePreview = () => {
  const inputs = useAppDataStore((s) => s.inputs);
  const loading = useAppDataStore((s) => s.status.loading);
  const { generated } = useGeneratedResume();

  if (loading) return <SkeletonLines lines={6} />;

  const txt = generated.trim();
  if (txt) {
    return (
      <div className="space-y-4">
        <div className="bg-background rounded-lg p-4 max-h-[400px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{txt}</pre>
        </div>
      </div>
    );
  }

  if (inputs.resumeText && inputs.jobText) {
    return <div className="text-sm text-slate-500">Resume ready to generate — click <b>Generate</b>.</div>;
  }
  return <div className="text-sm text-slate-500">Add your résumé & job to see a preview.</div>;
};
