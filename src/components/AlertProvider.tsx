"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, wsUrl } from "@/lib/api";
import { enableAudio, startSiren, stopSiren } from "@/lib/siren";
import { isUrgent, type SecurityEvent } from "@/lib/types";

interface Alert {
  siren: boolean;
  event: SecurityEvent;
}

interface AlertsContext {
  current: Alert | undefined;
  tick: number;
  audioReady: boolean;
  unlockAudio: () => Promise<void>;
  show: (event: SecurityEvent) => void;
  respond: (id: string, response: "recognized" | "secure") => Promise<string | undefined>;
  dismiss: () => void;
}

const Ctx = createContext<AlertsContext | null>(null);

export function useAlerts() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAlerts must be used inside AlertProvider");
  return ctx;
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Alert[]>([]);
  const [tick, setTick] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const current = queue[0];

  // Live connection with automatic reconnect.
  useEffect(() => {
    let ws: WebSocket;
    let retry: ReturnType<typeof setTimeout>;
    let stopped = false;

    const connect = () => {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data) as { type: string } & Alert;
        if (data.type !== "alert") return;
        setTick((t) => t + 1);
        if (isUrgent(data.event)) setQueue((q) => [...q, { siren: data.siren, event: data.event }]);
      };
      ws.onclose = () => {
        if (!stopped) retry = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      ws.close();
    };
  }, []);

  // Siren plays while a siren-level alert is on screen.
  useEffect(() => {
    if (current?.siren) startSiren();
    return stopSiren;
  }, [current]);

  const unlockAudio = useCallback(async () => {
    await enableAudio();
    setAudioReady(true);
  }, []);

  const show = useCallback((event: SecurityEvent) => setQueue((q) => [...q, { siren: false, event }]), []);
  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);

  const respond = useCallback(async (id: string, response: "recognized" | "secure") => {
    const { securityUrl } = await api<{ securityUrl?: string }>(`/events/${id}/respond`, {
      method: "POST",
      json: { response },
    });
    stopSiren();
    setTick((t) => t + 1);
    return securityUrl;
  }, []);

  return (
    <Ctx.Provider value={{ current, tick, audioReady, unlockAudio, show, respond, dismiss }}>
      {children}
    </Ctx.Provider>
  );
}
