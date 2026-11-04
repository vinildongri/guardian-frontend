"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import type { Account } from "@/lib/types";

const PLATFORMS = ["instagram", "snapchat", "whatsapp", "gmail", "linkedin", "github", "facebook"];

export default function AccountsPage() {
  const { data, error, reload } = useApi<Account[]>("/accounts", []);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [username, setUsername] = useState("");
  const [formError, setFormError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await api("/accounts", { method: "POST", json: { platform, username } });
      setUsername("");
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      await api(`/accounts/${id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  return (
    <>
      <h1 className="text-xl font-bold">Connected accounts</h1>

      <form onSubmit={add} className="card space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input capitalize">
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username, email or phone" required className="input" />
          <button className="btn-primary">Add</button>
        </div>
        <p className="text-xs text-slate-400">Guardian never asks for or stores your passwords for these services.</p>
        {formError && <p className="text-sm text-red-400">{formError}</p>}
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {data.length === 0 && <p className="text-sm text-slate-400">No accounts connected yet.</p>}

      <div className="space-y-2">
        {data.map((a) => (
          <div key={a.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-medium capitalize">{a.platform}</p>
              <p className="text-sm text-slate-400">{a.username}</p>
            </div>
            <button onClick={() => remove(a.id)} className="btn-ghost">
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
