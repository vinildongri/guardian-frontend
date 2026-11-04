"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import type { Device } from "@/lib/types";

const TYPES = ["phone", "laptop", "desktop", "other"];

export default function DevicesPage() {
  const { data, error, reload } = useApi<Device[]>("/devices", []);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [formError, setFormError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await api("/devices", { method: "POST", json: { name, type } });
      setName("");
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      await api(`/devices/${id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold">Trusted devices</h1>

      <form onSubmit={add} className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Device name, e.g. Windows / Chrome" required className="input" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="input capitalize">
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button className="btn-primary">Trust device</button>
        </div>
        <p className="text-xs text-slate-400">Logins from a trusted device are rated low risk. Names must match what the event reports.</p>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {data.length === 0 && <p className="text-sm text-slate-400">No trusted devices yet.</p>}

      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-sm capitalize text-slate-400">{d.type}</p>
            </div>
            <button onClick={() => remove(d.id)} className="btn-ghost">
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
