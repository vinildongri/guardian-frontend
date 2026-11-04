"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import SeverityBadge from "@/components/SeverityBadge";
import { STATUS_LABEL, type Account, type SecurityEvent } from "@/lib/types";

export default function TimelinePage() {
  const accounts = useApi<Account[]>("/accounts", []);
  const events = useApi<SecurityEvent[]>("/events", []);
  const [accountId, setAccountId] = useState("");

  const visible = accountId ? events.data.filter((e) => e.accountId === accountId) : events.data;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Security timeline</h1>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="input w-auto">
          <option value="">All accounts</option>
          {accounts.data.map((a) => (
            <option key={a.id} value={a.id}>
              {a.platform} – {a.username}
            </option>
          ))}
        </select>
      </div>

      {events.error && <p className="text-sm text-red-400">{events.error}</p>}
      {visible.length === 0 && <p className="text-sm text-slate-400">No events to show.</p>}

      <div className="space-y-2">
        {visible.map((e) => (
          <div key={e.id} className="card flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p>
                <span className="font-medium capitalize">{e.account.platform}</span> · {e.eventType.replaceAll("_", " ")}
              </p>
              <p className="text-slate-400">
                {new Date(e.createdAt).toLocaleString()}
                {e.device && ` · ${e.device}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{STATUS_LABEL[e.status]}</span>
              <SeverityBadge severity={e.severity} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
