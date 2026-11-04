"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useAlerts } from "@/components/AlertProvider";
import SeverityBadge from "@/components/SeverityBadge";
import SimulateEvent from "@/components/SimulateEvent";
import { isUrgent, type Account, type SecurityEvent } from "@/lib/types";

export default function DashboardPage() {
  const accounts = useApi<Account[]>("/accounts", []);
  const events = useApi<SecurityEvent[]>("/events", []);
  const { show } = useAlerts();

  const unresolved = events.data.filter((e) => e.status === "PENDING" && isUrgent(e));
  const flagged = new Set(unresolved.map((e) => e.accountId));

  return (
    <>
      <div className={`card ${flagged.size ? "border-red-500/60" : "border-emerald-500/40"}`}>
        <p className="text-sm text-slate-400">Overall security status</p>
        <p className={`text-2xl font-bold ${flagged.size ? "text-red-400" : "text-emerald-400"}`}>
          {flagged.size ? `${flagged.size} account${flagged.size > 1 ? "s" : ""} need review` : "All accounts protected"}
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">Connected accounts</h2>
        {accounts.data.length === 0 ? (
          <p className="text-sm text-slate-400">
            No accounts yet.{" "}
            <Link href="/accounts" className="text-sky-400 hover:underline">
              Add one
            </Link>
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.data.map((a) => (
              <div key={a.id} className="card">
                <p className="font-semibold capitalize">{a.platform}</p>
                <p className="text-sm text-slate-400">{a.username}</p>
                <p className={`mt-2 text-sm font-medium ${flagged.has(a.id) ? "text-red-400" : "text-emerald-400"}`}>
                  {flagged.has(a.id) ? "Review Required" : "Protected"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {unresolved.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Unresolved alerts</h2>
          {unresolved.map((e) => (
            <div key={e.id} className="card flex items-center justify-between gap-3 py-3">
              <div className="text-sm">
                <span className="font-medium capitalize">{e.account.platform}</span> · {e.eventType.replaceAll("_", " ")} ·{" "}
                {new Date(e.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-3">
                <SeverityBadge severity={e.severity} />
                <button onClick={() => show(e)} className="btn-ghost">
                  Review
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <SimulateEvent accounts={accounts.data} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent events</h2>
          <Link href="/timeline" className="text-sm text-sky-400 hover:underline">
            View all
          </Link>
        </div>
        {events.data.length === 0 && <p className="text-sm text-slate-400">No security events yet.</p>}
        <div className="space-y-2">
          {events.data.slice(0, 5).map((e) => (
            <div key={e.id} className="card flex items-center justify-between py-3 text-sm">
              <span>
                <span className="font-medium capitalize">{e.account.platform}</span> · {e.eventType.replaceAll("_", " ")}
              </span>
              <SeverityBadge severity={e.severity} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
