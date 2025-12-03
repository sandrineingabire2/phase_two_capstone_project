import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PostsList } from "@/components/posts/posts-list";
import { PostSearch } from "@/components/posts/post-search";
import { TagFilter } from "@/components/posts/tag-filter";
import { mapPostSummary, postSummaryInclude } from "@/lib/post-utils";

export const revalidate = 120;

type PostsPageProps = {
  searchParams?: Promise<{
    tag?: string;
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const activeTag = params?.tag || undefined;
  const session = await auth();

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
        <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
          Latest posts
        </h1>
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

      <PostsList
        initialPosts={posts.map(mapPostSummary)}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
