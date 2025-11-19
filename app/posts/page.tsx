import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 120;

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published", deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      createdAt: true,
      author: { select: { name: true } },
    },
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
        <div className="mt-4 flex gap-3">
          <Link
            href="/editor"
            className="rounded-full bg-[var(--color-foreground)] px-5 py-2 text-sm font-semibold text-white"
          >
            New post
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-semibold text-[var(--color-foreground)]"
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
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
            >
              {post.coverImage ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={false}
                    loading="lazy"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-48 w-full bg-[var(--color-surface-muted)]" />
              )}
              <div className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  {post.author?.name ?? "Unknown"} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="text-sm text-[var(--color-muted)]">{post.excerpt}</p>
                ) : null}
                <Link
                  href={/posts/}
                  className="inline-flex items-center text-sm font-semibold text-[var(--color-foreground)] underline-offset-4 hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
