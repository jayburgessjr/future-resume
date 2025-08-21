import { useMemo, useState } from "react";
import { useAppDataStore, selectGeneratedResume } from "@/stores/appData";

export function useGeneratedResume() {
  const generatedFromStore = useAppDataStore(selectGeneratedResume);
  const [localPreview, setLocalPreview] = useState("");
  const generated = localPreview || generatedFromStore;
  const wordCount = useMemo(() => (generated.match(/\S+/g) || []).length, [generated]);
  return { generated, setLocalPreview, wordCount };
}
