import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Lab 5
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">
          Tags directory
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Every published post can be tagged for discovery. Browse the most active topics
          below.
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              #{tag.slug}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
              {tag.name}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {tag._count.posts} post{tag._count.posts === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
