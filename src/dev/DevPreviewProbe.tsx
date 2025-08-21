import React from "react";
import { useAppDataStore } from "@/stores/appData";
import { selectGeneratedResume } from "@/stores/appData";

export function DevPreviewProbe() {
  const s = useAppDataStore();
  const generated = selectGeneratedResume(s);
  return (
    <div className="mt-4 rounded-md border p-3 text-xs">
      <div className="font-semibold">Dev Probe</div>
      <div>loading: {String(s?.status?.loading)}</div>
      <div>outputs keys: {JSON.stringify(Object.keys(s?.outputs || {}))}</div>
      <div>preview length: {generated?.length || 0}</div>
      <div className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap bg-muted/30 p-2">
        {generated || "(empty)"}
      </div>
      <div className="mt-2 flex gap-2">
        <button
          className="px-2 py-1 border rounded"
          onClick={() =>
            useAppDataStore.setState((st:any) => ({
              outputs: { ...st.outputs, resume: generated || "TEST PREVIEW — wiring OK" },
            }))
          }
        >
          Force Preview
        </button>
      </div>
    </div>
  );
}
