import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "published", deletedAt: null },
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findFirst({
    where: { slug: params.slug, status: "published", deletedAt: null },
    include: { author: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
          {post.author?.name ?? "Anonymous"} ·{" "}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <h1 className="text-4xl font-semibold text-[var(--color-foreground)]">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="text-lg text-[var(--color-muted)]">{post.excerpt}</p>
        ) : null}
      </header>
      {post.coverImage ? (
        <div className="relative h-96 w-full overflow-hidden rounded-3xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-cover"
            priority={false}
            loading="lazy"
            unoptimized
          />
        </div>
      ) : null}
      <div
        className="prose prose-slate max-w-none text-[var(--color-foreground)]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
