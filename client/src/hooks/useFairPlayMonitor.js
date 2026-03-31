import { useEffect } from "react";
import { antiCheat } from "../lib/antiCheat";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";

export function useFairPlayMonitor(activityId) {
  const toast = useToast();

  useEffect(() => {
    return antiCheat.start({
      onSuspicious: async (evt) => {
        toast.push({
          title: "Fair-play alert",
          message: evt.message,
          kind: "warning",
        });

        try {
          await api.post("/api/audit/event", {
            type: evt.type,
            meta: { ...(evt.meta || {}), activityId },
          });
        } catch {
          // Ignore audit failures so activities stay smooth.
        }
      },
    });
  }, [activityId, toast]);
}
