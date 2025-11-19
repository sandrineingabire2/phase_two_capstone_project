import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().max(320).optional().or(z.literal("")),
  content: z.string().min(10).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).optional(),
});

async function findPost(postId: string) {
  return prisma.post.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id: postId }, { slug: postId }],
    },
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

export async function GET(_request: Request, { params }: { params: { postId: string } }) {
  const post = await prisma.post.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id: params.postId }, { slug: params.postId }],
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: { params: { postId: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await findPost(params.postId);

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

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      slug: slug ?? post.slug,
      title: payload.title ?? post.title,
      excerpt: payload.excerpt ?? post.excerpt,
      content: payload.content ?? post.content,
      coverImage: payload.coverUrl ?? post.coverImage,
      status: payload.status ?? post.status,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await findPost(params.postId);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { deletedAt: new Date(), status: "draft" },
  });

  return NextResponse.json({ success: true });
}
