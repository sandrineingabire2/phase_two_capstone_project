import { Prisma } from "@prisma/client";
import { PostDetail, PostSummary } from "@/types/content";

export const postSummaryInclude = {
  author: { select: { id: true, name: true, avatarUrl: true } },
  tags: { include: { tag: true } },
  reactions: { select: { type: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

export const postDetailInclude = postSummaryInclude;

export type PostSummaryPayload = Prisma.PostGetPayload<{
  include: typeof postSummaryInclude;
}>;

export function mapPostSummary(post: PostSummaryPayload): PostSummary {
  const likes = post.reactions.filter((reaction) => reaction.type === "like").length;
  const claps = post.reactions.filter((reaction) => reaction.type === "clap").length;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    status: post.status,
    createdAt: post.createdAt.toISOString(),
    tags: post.tags.map((tag) => ({
      id: tag.tag.id,
      name: tag.tag.name,
      slug: tag.tag.slug,
    })),
    author: {
      id: post.author.id,
      name: post.author.name,
      avatarUrl: post.author.avatarUrl,
    },
    reactionTotals: {
      likes,
      claps,
    },
    commentCount: post._count.comments,
  };
}

export type PostDetailPayload = Prisma.PostGetPayload<{
  include: typeof postDetailInclude;
}>;

export function mapPostDetail(post: PostDetailPayload): PostDetail {
  const summary = mapPostSummary(post);
  return {
    ...summary,
    content: post.content,
    updatedAt: post.updatedAt.toISOString(),
  };
}
