"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        "hover:bg-[var(--color-surface-muted)]",
        isActive
          ? "bg-[var(--color-foreground)] text-[var(--color-background)] shadow-sm"
          : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      )}
    >
      {label}
    </Link>
  );
}
