"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import type { Settings } from "@/lib/types";

function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError("");
    try {
      await api("/settings", { method: "PUT", json: form });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={save} className="card max-w-md space-y-4">
      <label className="flex items-center gap-3">
        <input type="checkbox" checked={form.sleepMode} onChange={(e) => setForm({ ...form, sleepMode: e.target.checked })} className="size-4" />
        <span>Enable Sleep Protection</span>
      </label>
      <p className="text-sm text-slate-400">During sleep hours, high-risk events also trigger the siren.</p>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Sleep starts
          <input type="time" value={form.sleepStart} onChange={(e) => setForm({ ...form, sleepStart: e.target.value })} required className="input mt-1" />
        </label>
        <label className="text-sm">
          Sleep ends
          <input type="time" value={form.sleepEnd} onChange={(e) => setForm({ ...form, sleepEnd: e.target.value })} required className="input mt-1" />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Saved.</p>}
      <button className="btn-primary">Save settings</button>
    </form>
  );
}

export default function SettingsPage() {
  const { data, error } = useApi<Settings | null>("/settings", null);

  return (
    <>
      <h1 className="text-xl font-bold">Settings</h1>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {data && <SettingsForm initial={data} />}
    </>
  );
}
