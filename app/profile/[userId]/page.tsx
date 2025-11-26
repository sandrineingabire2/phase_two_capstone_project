import { notFound } from "next/navigation";
import { FollowButton } from "@/components/profile/follow-button";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";
import { mapPostSummary, postSummaryInclude } from "@/lib/post-utils";

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: { authorId: user.id, status: "published", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: postSummaryInclude,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
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
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Author
              </p>
              <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
                {user.name}
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {user.bio ?? "This author hasn't added a bio yet."}
              </p>
            </div>
          </div>
          <FollowButton userId={user.id} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Authored posts
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Work published under this profile.
          </p>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No posts yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={mapPostSummary(post)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
