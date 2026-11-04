"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import AlertProvider, { useAlerts } from "@/components/AlertProvider";
import AlertModal from "@/components/AlertModal";
import ChatPanel from "@/components/ChatPanel";

const LINKS = [
  ["Dashboard", "/dashboard"],
  ["Timeline", "/timeline"],
  ["Accounts", "/accounts"],
  ["Devices", "/devices"],
  ["Settings", "/settings"],
];

function Header({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const { audioReady, unlockAudio } = useAlerts();

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-3">
        <span className="font-bold">Guardian</span>
        <nav className="flex flex-1 gap-1 text-sm">
          {LINKS.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 ${pathname === href ? "bg-slate-800" : "text-slate-400 hover:text-slate-100"}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        {!audioReady && (
          <button onClick={unlockAudio} className="btn-ghost">
            Enable siren sound
          </button>
        )}
        <span className="text-sm text-slate-400">{user.name}</span>
        <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-100">
          Log out
        </button>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!user) return null;

  return (
    <AlertProvider>
      <Header user={user} />
      <main className="mx-auto max-w-5xl space-y-6 p-6">{children}</main>
      <AlertModal />
      <ChatPanel />
    </AlertProvider>
  );
}
