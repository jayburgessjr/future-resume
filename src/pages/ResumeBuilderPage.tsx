import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { ExportBar } from "@/components/export/ExportBar";
import { useAppDataStore } from "@/stores";
import { DevPreviewProbe } from "@/dev/DevPreviewProbe";
import { useGeneratedResume } from "@/hooks/useGeneratedResume";

export default function ResumeBuilderPage() {
  const { inputs, updateInputs, isReadyToGenerate } = useAppDataStore();
  const { generated, setLocalPreview, wordCount } = useGeneratedResume();
  const loading = useAppDataStore((s) => s.status.loading);

  return (
    <div className="p-6 space-y-4">
      <Textarea
        value={inputs.resumeText}
        onChange={(e) => updateInputs({ resumeText: e.target.value })}
        placeholder="Paste your current resume"
        className="min-h-[150px]"
      />
      <Textarea
        value={inputs.jobText}
        onChange={(e) => updateInputs({ jobText: e.target.value })}
        placeholder="Paste the job description"
        className="min-h-[150px]"
      />
      <Button
        onClick={async () => {
          const t = await useAppDataStore.getState().runGeneration();
          setLocalPreview((t && t.trim()) || "");
        }}
        disabled={loading || !isReadyToGenerate()}
      >
        {loading ? "Generating..." : "Generate"}
      </Button>

      {generated ? (
        <>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans">
            {generated.length > 1000 ? generated.slice(0, 1000) + "…" : generated}
          </pre>
          <div className="mt-3 text-xs text-muted-foreground">
            Words: {wordCount}/550 {wordCount > 550 && <span className="text-destructive ml-2">Over limit</span>}
          </div>
          <FeatureGuard feature="exports">
            <ExportBar content={generated} title="Resume" metadata={{ wordCount }} className="text-xs" />
          </FeatureGuard>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">Resume ready to generate — click Generate.</div>
      )}

      {process.env.NODE_ENV !== "production" && <DevPreviewProbe />}
    </div>
  );
}
