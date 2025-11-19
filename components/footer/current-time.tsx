"use client";

import { useClientTime } from "@/hooks/use-client-time";

export function CurrentTime() {
  const now = useClientTime(30_000);

  return (
    <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
      Local time · {now}
    </span>
  );
}
