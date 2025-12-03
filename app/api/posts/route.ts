import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  mapPostSummary,
  postSummaryInclude,
  type PostSummaryPayload,
} from "@/lib/post-utils";
import { syncTags } from "@/lib/tag-utils";

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().max(320).optional().or(z.literal("")),
  content: z.string().min(10),
  coverUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
  tags: z.array(z.string().min(2)).max(6).optional(),
});

const updateTagsSchema = z.array(z.string().min(2)).max(6);

async function generateUniqueSlug(title: string) {
  const base = slugify(title);
  let uniqueSlug = base;
  let counter = 1;

  while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${base}-${counter}`;
    counter += 1;
  }

  return uniqueSlug;
}

function buildWhereClause(params: URLSearchParams, sessionUserId?: string) {
  const includeDrafts = params.get("includeDrafts") === "true";
  const authorId = params.get("authorId");
  const tagSlug = params.get("tag");
  const filter = params.get("filter");
  const query = params.get("q");

  const where: Prisma.PostWhereInput = {
    deletedAt: null,
  };

  if (!includeDrafts) {
    where.status = "published";
  } else if (sessionUserId) {
    where.authorId = sessionUserId;
  } else {
    throw new Error("UNAUTHORIZED_DRAFTS");
  }

  if (authorId) {
    where.authorId = authorId;
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  if (filter === "following") {
    if (!sessionUserId) {
      throw new Error("UNAUTHORIZED_FOLLOWING");
    }
    where.author = {
      followers: {
        some: {
          followerId: sessionUserId,
        },
      },
    };
  }

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { excerpt: { contains: query } },
      { content: { contains: query } },
      { tags: { some: { tag: { name: { contains: query } } } } },
    ];
  }

  return where;
}

function getOrderBy(sort: string | null): Prisma.PostOrderByWithRelationInput[] {
  if (sort === "recommended") {
    return [{ reactions: { _count: "desc" } }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }];
}

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get("limit") ?? "10");
  const limit = Math.min(Number.isNaN(requestedLimit) ? 10 : requestedLimit, 24);
  const cursor = searchParams.get("cursor");
  const sort = searchParams.get("sort");

  let where: Prisma.PostWhereInput;

  try {
    where = buildWhereClause(searchParams, session?.user?.id);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DRAFTS") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED_FOLLOWING") {
      return NextResponse.json(
        { error: "Sign in to view your following feed" },
        { status: 401 }
      );
    }
    throw error;
  }

  const posts = await prisma.post.findMany({
    where,
    include: postSummaryInclude,
    orderBy: getOrderBy(sort),
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const trimmed = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? posts[limit].id : null;

  return NextResponse.json({
    posts: trimmed.map(mapPostSummary),
    nextCursor,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = postSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, excerpt, content, coverUrl, status, tags } = parsed.data;
  const slug = await generateUniqueSlug(title);

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      excerpt: excerpt || null,
      content,
      coverImage: coverUrl || null,
      status,
      authorId: session.user.id,
    },
  });

  await syncTags(post.id, tags);

  const hydrated = await prisma.post.findUnique({
    where: { id: post.id },
    include: postSummaryInclude,
  });

  return NextResponse.json(
    { post: mapPostSummary(hydrated as PostSummaryPayload) },
    { status: 201 }
  );
}

export const tagListSchema = updateTagsSchema;
