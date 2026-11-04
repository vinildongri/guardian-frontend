"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAlerts } from "@/components/AlertProvider";

// Fetches a path and refetches whenever a live alert arrives.
export function useApi<T>(path: string, initial: T) {
  const { tick } = useAlerts();
  const [data, setData] = useState<T>(initial);
  const [error, setError] = useState("");

  const reload = useCallback(
    () =>
      api<T>(path)
        .then((d) => {
          setData(d);
          setError("");
        })
        .catch((e: Error) => setError(e.message)),
    [path]
  );

  useEffect(() => {
    reload();
  }, [reload, tick]);

  return { data, error, reload };
}
