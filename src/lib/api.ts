const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const wsUrl = API.replace(/^http/, "ws") + "/ws";

interface Options extends Omit<RequestInit, "body"> {
  json?: unknown;
}

export async function api<T>(path: string, { json, ...init }: Options = {}): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    credentials: "include",
    headers: json ? { "Content-Type": "application/json" } : undefined,
    body: json ? JSON.stringify(json) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Request failed");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
