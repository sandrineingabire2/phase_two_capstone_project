import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  mapPostDetail,
  mapPostSummary,
  postSummaryInclude,
  type PostDetailPayload,
  type PostSummaryPayload,
} from "@/lib/post-utils";
import { syncTags } from "@/lib/tag-utils";

const tagArraySchema = z.array(z.string().min(2)).max(6);

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().max(320).optional().or(z.literal("")),
  content: z.string().min(10).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).optional(),
  tags: tagArraySchema.optional(),
});

async function findPost(postId: string) {
  return prisma.post.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id: postId }, { slug: postId }],
    },
    include: postSummaryInclude,
  });
}

async function nextSlug(currentId: string, title?: string) {
  if (!title) {
    const existing = await prisma.post.findUnique({ where: { id: currentId } });
    return existing?.slug;
  }

  const base = slugify(title);
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === currentId) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const post = await findPost(postId);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post: mapPostDetail(post as PostDetailPayload) });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;
  const post = await findPost(postId);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await request.json();
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const slug = await nextSlug(post.id, payload.title);

  await prisma.post.update({
    where: { id: post.id },
    data: {
      slug: slug ?? post.slug,
      title: payload.title ?? post.title,
      excerpt: payload.excerpt ?? post.excerpt,
      content: payload.content ?? post.content,
      coverImage: payload.coverUrl ?? post.coverImage,
      status: payload.status ?? post.status,
    },
  });

  await syncTags(post.id, payload.tags);

  const hydrated = await findPost(post.id);

  if (!hydrated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    post: mapPostSummary(hydrated as PostSummaryPayload),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;
  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id: postId }, { slug: postId }],
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({
    where: { id: post.id },
  });

  return NextResponse.json({ success: true });
}
