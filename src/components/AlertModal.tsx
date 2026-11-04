"use client";

import { useState } from "react";
import { useAlerts } from "./AlertProvider";
import SeverityBadge from "./SeverityBadge";

export default function AlertModal() {
  const { current, respond, dismiss } = useAlerts();
  const [followUp, setFollowUp] = useState<{ url?: string } | null>(null);
  const [error, setError] = useState("");

  if (!current) return null;
  const { event } = current;

  async function answer(response: "recognized" | "secure") {
    setError("");
    try {
      const url = await respond(event.id, response);
      if (response === "secure") setFollowUp({ url });
      else dismiss();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function done() {
    setFollowUp(null);
    dismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 p-4">
      <div className="w-full max-w-md animate-pulse rounded-2xl border-2 border-red-500 bg-slate-900 p-6 text-center">
        <p className="text-xs font-bold tracking-widest text-red-400">
          {event.severity === "CRITICAL" ? "CRITICAL SECURITY ALERT" : "SECURITY ALERT"}
        </p>
        <h2 className="mt-3 text-2xl font-bold capitalize">{event.account.platform}</h2>
        <p className="mt-1 text-slate-300">{event.eventType.replaceAll("_", " ")}</p>

        <dl className="mt-4 space-y-1 text-sm text-slate-400">
          <div>Time: {new Date(event.createdAt).toLocaleTimeString()}</div>
          {event.device && <div>Device: {event.device}</div>}
          <div>
            Severity: <SeverityBadge severity={event.severity} />
          </div>
        </dl>

        {followUp ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-slate-300">Marked for securing. Review the activity on the official page.</p>
            {followUp.url && (
              <a href={followUp.url} target="_blank" rel="noopener noreferrer" className="btn-danger block">
                Open official security page
              </a>
            )}
            <button onClick={done} className="btn-ghost w-full">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="mt-6 text-lg font-semibold">Was this you?</p>
            <div className="mt-3 flex gap-3">
              <button onClick={() => answer("recognized")} className="btn-primary flex-1">
                This was me
              </button>
              <button onClick={() => answer("secure")} className="btn-danger flex-1">
                Secure account
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
