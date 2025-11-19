"use client";

import { useEffect, useState } from "react";

export function useClientTime(interval = 60_000) {
  const [value, setValue] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setValue(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "2-digit",
  }).format(value);
}
