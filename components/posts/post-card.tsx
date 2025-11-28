import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/types/content";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      {post.coverImage ? (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
          <span>{post.author.name}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)]">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="text-sm text-[var(--color-muted)]">{post.excerpt}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-muted)]">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-[var(--color-border)] px-3 py-1 uppercase tracking-wide hover:text-[var(--color-foreground)]"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs font-semibold text-[var(--color-muted)]">
          <span>👍 {post.reactionTotals.likes}</span>
          <span>👏 {post.reactionTotals.claps}</span>
          <span>💬 {post.commentCount}</span>
        </div>
        <Link
          href={`/posts/${post.slug}`}
          className="inline-flex items-center text-sm font-semibold text-[var(--color-foreground)] underline-offset-4 hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
