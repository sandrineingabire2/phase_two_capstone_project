import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CommentsPanel } from "@/components/posts/comments-panel";
import { ReactionBar } from "@/components/posts/reaction-bar";
import { prisma } from "@/lib/prisma";
import { mapPostDetail, postDetailInclude } from "@/lib/post-utils";
import { siteMetadata } from "@/lib/site-config";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "published", deletedAt: null },
    select: { slug: true },
  });

  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!post || post.deletedAt || post.status !== "published") {
    return {};
  }

  const url = `${siteMetadata.siteUrl}/posts/${slug}`;
  const description = post.excerpt ?? siteMetadata.description;

  return {
    title: `${post.title} | ${siteMetadata.name}`,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postRecord = await prisma.post.findUnique({
    where: { slug },
    include: postDetailInclude,
  });

  if (postRecord?.deletedAt) {
    notFound();
  }

  if (!postRecord) {
    notFound();
  }

  const post = mapPostDetail(postRecord);

  return (
    <div className="space-y-10">
      <article className="space-y-6">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
            {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <h1 className="text-4xl font-semibold text-[var(--color-foreground)]">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="text-lg text-[var(--color-muted)]">{post.excerpt}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </header>
        {post.coverImage ? (
          <div className="relative h-96 w-full overflow-hidden rounded-3xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
        <div
          className="prose prose-slate max-w-none text-slate-900 prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto prose-img:max-w-full prose-img:h-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      <ReactionBar postId={post.id} />
      <CommentsPanel postId={post.id} />
    </div>
  );
}
