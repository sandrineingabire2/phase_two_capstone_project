import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { posts: { orderBy: { createdAt: "desc" } } },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
          {user.avatarUrl ? (
            <div
              className="h-24 w-24 rounded-full border border-[var(--color-border)] bg-cover bg-center"
              style={{ backgroundImage: `url(${user.avatarUrl})` }}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-2xl font-semibold text-[var(--color-foreground)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">Author</p>
            <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">{user.name}</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{user.bio ?? "This author hasn't added a bio yet."}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">Authored posts</h2>
          <p className="text-sm text-[var(--color-muted)]">Work published under this profile.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {user.posts.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No posts yet.</p>
          ) : (
            user.posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">{post.title}</h3>
                {post.excerpt ? (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{post.excerpt}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
