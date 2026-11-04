export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EventStatus = "PENDING" | "RECOGNIZED" | "SECURING";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Account {
  id: string;
  platform: string;
  username: string;
}

export interface SecurityEvent {
  id: string;
  accountId: string;
  eventType: string;
  severity: Severity;
  device: string | null;
  status: EventStatus;
  createdAt: string;
  account: Account;
}

export interface Device {
  id: string;
  name: string;
  type: string;
}

export interface Settings {
  sleepMode: boolean;
  sleepStart: string;
  sleepEnd: string;
}

export const STATUS_LABEL: Record<EventStatus, string> = {
  PENDING: "Awaiting response",
  RECOGNIZED: "Recognized",
  SECURING: "Secured",
};

export const isUrgent = (e: SecurityEvent) => e.severity === "HIGH" || e.severity === "CRITICAL";
