import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { emitToast } from "@/utils/toastEmitter";
import { applicationsApi } from "../api";
import { APPLICATION_QUERY_KEYS } from "../queries";
import type { ApplicationDetail } from "../types";

export function useApplicationActions(
  id: string | undefined,
  patchApp: (patch: Partial<ApplicationDetail>) => void,
) {
  const [deciding, setDeciding] = useState(false);
  const qc = useQueryClient();

  const handleDecision = useCallback(async (decision: "shortlisted" | "rejected") => {
    if (!id) return;
    setDeciding(true);

    // Snapshot previous value for rollback
    const prev = qc.getQueryData<ApplicationDetail>(APPLICATION_QUERY_KEYS.detail(id));
    // Optimistic update immediately
    patchApp({ recruiterDecision: decision });

    try {
      await applicationsApi.updateDecision(id, decision);
      qc.invalidateQueries({ queryKey: ["applications", "summary"] });
      emitToast({
        message: decision === "shortlisted" ? "Candidate shortlisted." : "Candidate rejected.",
        severity: "success",
      });
    } catch (err: unknown) {
      // Roll back to previous value
      if (prev) patchApp({ recruiterDecision: prev.recruiterDecision });
      emitToast({ message: err instanceof Error ? err.message : "Failed to update decision.", severity: "error" });
    } finally {
      setDeciding(false);
    }
  }, [id, patchApp, qc]);

  return { deciding, handleDecision };
}
