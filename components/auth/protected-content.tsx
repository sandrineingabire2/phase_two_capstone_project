"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type ProtectedContentProps = {
  children: React.ReactNode;
};

export function ProtectedContent({ children }: ProtectedContentProps) {
  const { status } = useSession();

  if (status === "loading") {
    return <p className="text-sm text-[var(--color-muted)]">Checking access…</p>;
  }

  if (status !== "authenticated") {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        This section is protected. <Link href="/login" className="underline">Sign in</Link> to continue.
      </p>
    );
  }

  return <>{children}</>;
}
