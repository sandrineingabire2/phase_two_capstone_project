import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/posts/post-card";
import { PostSearch } from "@/components/posts/post-search";
import { TagFilter } from "@/components/posts/tag-filter";
import { mapPostSummary, postSummaryInclude } from "@/lib/post-utils";

export const revalidate = 120;

type PostsPageProps = {
  searchParams?: {
    tag?: string;
  };
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const activeTag = searchParams?.tag || undefined;

  const posts = await prisma.post.findMany({
    where: {
      status: "published",
      deletedAt: null,
      ...(activeTag ? { tags: { some: { tag: { slug: activeTag } } } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: postSummaryInclude,
    take: 12,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Lab 4 · Publishing
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">
          Latest posts
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Draft in the editor, publish when ready, and preview responsive media with
          optimized delivery.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <PostSearch />
          <TagFilter activeTag={activeTag} />
        </div>
        <div className="mt-4 flex gap-3">
          <Link
            href="/editor"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            New post
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Manage drafts
          </Link>
        </div>
      </section>

      {posts.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No published posts yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={mapPostSummary(post)} />
          ))}
        </div>
      )}
    </div>
  );
}
