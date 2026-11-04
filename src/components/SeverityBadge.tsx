import type { Severity } from "@/lib/types";

const STYLES: Record<Severity, string> = {
  LOW: "bg-emerald-500/15 text-emerald-400",
  MEDIUM: "bg-amber-500/15 text-amber-400",
  HIGH: "bg-orange-500/15 text-orange-400",
  CRITICAL: "bg-red-500/15 text-red-400",
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[severity]}`}>{severity}</span>;
}
