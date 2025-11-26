import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { CommentNode } from "@/types/content";

const createSchema = z.object({
  content: z.string().min(2, "Comment is too short"),
  parentId: z.string().optional(),
});

async function resolvePostId(postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      deletedAt: null,
      status: "published",
      OR: [{ id: postId }, { slug: postId }],
    },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  return post.id;
}

function buildTree(records: Array<CommentNode & { parentId?: string | null }>) {
  const map = new Map<string, CommentNode & { parentId?: string | null }>();
  const roots: CommentNode[] = [];

  records.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  map.forEach((comment) => {
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.replies.push(comment);
      } else {
        roots.push(comment);
      }
    } else {
      roots.push(comment);
    }
  });

  return roots;
}

export async function GET(_request: Request, { params }: { params: { postId: string } }) {
  try {
    const postId = await resolvePostId(params.postId);
    const comments = await prisma.comment.findMany({
      where: { postId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const mapped = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId,
      replies: [] as CommentNode[],
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatarUrl: comment.author.avatarUrl,
      },
    }));

    return NextResponse.json({ comments: buildTree(mapped) });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function POST(request: Request, { params }: { params: { postId: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = createSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  let postId: string;

  try {
    postId = await resolvePostId(params.postId);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    throw error;
  }

  if (payload.data.parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: payload.data.parentId, postId },
    });
    if (!parent) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: payload.data.content,
      postId,
      parentId: payload.data.parentId ?? null,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        parentId: comment.parentId,
        author: comment.author,
      },
    },
    { status: 201 }
  );
}
