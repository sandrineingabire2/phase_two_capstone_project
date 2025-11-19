import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { navigationLinks, siteMetadata } from "@/lib/site-config";
import { NavLink } from "@/components/navigation/nav-link";

export async function SiteHeader() {
  const session = await auth();
  const nameInitial = session?.user?.name?.charAt(0);
  const emailInitial = session?.user?.email?.charAt(0);
  const avatarLetter = (nameInitial ?? emailInitial ?? "?").toUpperCase();

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {siteMetadata.name}
          </span>
          <span className="text-sm text-[var(--color-muted)]">
            {siteMetadata.description}
          </span>
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <nav className="flex flex-wrap gap-2">
            {navigationLinks.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            {session ? <NavLink href="/account" label="Account" /> : null}
          </nav>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white/60 px-3 py-2 text-sm text-[var(--color-foreground)]">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-foreground)] text-sm font-semibold text-white">
                    {avatarLetter}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold">
                      {session.user?.name ?? "Member"}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {session.user?.email}
                    </span>
                  </div>
                </div>
                <SignOutButton />
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-contrast)]"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
