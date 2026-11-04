"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const json = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      await api(`/auth/${mode}`, { method: "POST", json });
      router.replace("/dashboard");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Guardian</h1>
          <p className="text-sm text-slate-400">{isLogin ? "Sign in to your security dashboard" : "Create your Guardian account"}</p>
        </div>

        {!isLogin && <input name="name" placeholder="Name" required className="input" />}
        <input name="email" type="email" placeholder="Email" required className="input" />
        <input name="password" type="password" placeholder="Password" minLength={8} required className="input" />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button disabled={busy} className="btn-primary w-full">
          {isLogin ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-400">
          {isLogin ? "No account? " : "Already registered? "}
          <Link href={isLogin ? "/register" : "/login"} className="text-sky-400 hover:underline">
            {isLogin ? "Register" : "Sign in"}
          </Link>
        </p>
      </form>
    </main>
  );
}
