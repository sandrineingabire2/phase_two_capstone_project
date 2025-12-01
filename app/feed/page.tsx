import { auth } from "@/auth";
import { FeedPageClient } from "@/components/feed/feed-page-client";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";
import { mapPostSummary, postSummaryInclude } from "@/lib/post-utils";

export const revalidate = 60;

export default async function FeedPage() {
  const session = await auth();

  const [latest, recommended] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published", deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: postSummaryInclude,
      take: 3,
    }),
    prisma.post.findMany({
      where: { status: "published", deletedAt: null },
      orderBy: [{ reactions: { _count: "desc" } }, { createdAt: "desc" }],
      include: postSummaryInclude,
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">UPDATES</h1>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
              Fresh highlights
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Latest posts across the network.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {latest.map((post) => (
            <PostCard key={post.id} post={mapPostSummary(post)} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
              Recommended for you
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Posts with the most claps and likes roll into this section.
            </p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {recommended.map((post) => (
            <PostCard key={`recommended-${post.id}`} post={mapPostSummary(post)} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Keep scrolling
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Infinite scroll switches between latest, recommended, and following tabs.
          </p>
        </div>
        <FeedPageClient isAuthenticated={Boolean(session?.user)} />
      </section>
    </div>
  );
}
