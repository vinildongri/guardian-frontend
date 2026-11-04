"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Account } from "@/lib/types";

const EVENT_TYPES = ["new_login", "new_device", "password_change", "recovery_change", "security_setting_change", "suspicious_activity"];

// Demo helper: real platforms don't expose login events, so this fires one by hand.
export default function SimulateEvent({ accounts }: { accounts: Account[] }) {
  const [accountId, setAccountId] = useState("");
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [device, setDevice] = useState("Windows / Chrome");
  const [error, setError] = useState("");

  if (accounts.length === 0) return null;

  async function send(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/events", {
        method: "POST",
        json: { accountId: accountId || accounts[0].id, eventType, device: device || undefined },
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={send} className="card space-y-3">
      <h2 className="font-semibold">Simulate a security event</h2>
      <p className="text-sm text-slate-400">For testing and demos. The alert arrives through the live connection.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={accountId || accounts[0].id} onChange={(e) => setAccountId(e.target.value)} className="input">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.platform} – {a.username}
            </option>
          ))}
        </select>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="input">
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input value={device} onChange={(e) => setDevice(e.target.value)} placeholder="Device" className="input" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="btn-primary">Trigger event</button>
    </form>
  );
}
