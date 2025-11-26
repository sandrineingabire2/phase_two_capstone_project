import { notFound } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";
import { mapPostSummary, postSummaryInclude } from "@/lib/post-utils";

export const revalidate = 120;

export async function generateStaticParams() {
  const tags = await prisma.tag.findMany({
    select: { slug: true },
    take: 50,
  });
  return tags.map((tag) => ({ slug: tag.slug }));
}

export default async function TagDetailPage({ params }: { params: { slug: string } }) {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        include: {
          post: {
            include: postSummaryInclude,
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const posts = tag.posts
    .map((entry) => entry.post)
    .filter(Boolean)
    .map((post) => mapPostSummary(post));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
          #tag
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">
          {tag.name}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {posts.length} post{posts.length === 1 ? "" : "s"} tagged with #{tag.slug}
        </p>
      </section>
      {posts.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No posts assigned to this tag yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
