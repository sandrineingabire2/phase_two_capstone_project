import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountForm } from "@/components/auth/account-form";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?from=account");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { posts: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <div
                className="h-16 w-16 rounded-full border border-[var(--color-border)] bg-center bg-cover"
                style={{ backgroundImage: `url(${user.avatarUrl})` }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-lg font-semibold text-[var(--color-foreground)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">Account</p>
              <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">{user.name}</h1>
              <p className="text-sm text-[var(--color-muted)]">{user.email}</p>
            </div>
          </div>
          <Link
            href={/profile/}
            className="text-sm font-semibold text-[var(--color-foreground)] underline-offset-4 hover:underline"
          >
            View public profile →
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Profile</h2>
          <p className="text-sm text-[var(--color-muted)]">Update your avatar and short bio.</p>
          <div className="mt-4">
            <AccountForm initialBio={user.bio} initialAvatarUrl={user.avatarUrl} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">Auth status</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--color-foreground)]">
            <li>
              Signed in as <span className="font-semibold">{user.email}</span>
            </li>
            <li>
              Posts authored: <span className="font-semibold">{user.posts.length}</span>
            </li>
            <li>Member since {user.createdAt.toLocaleDateString()}</li>
          </ul>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Add posts by seeding Prisma or wiring the CMS of your choice in future labs.
          </p>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </section>
    </div>
  );
}
