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
  console.log("DEBUG: Received postId:", postId);

  try {
    // Try to find by slug first (more common)
    let post = await prisma.post.findFirst({
      where: {
        slug: postId,
        deletedAt: null,
        status: "published",
      },
      select: { id: true },
    });

    // If not found by slug, try by ID
    if (!post) {
      post = await prisma.post.findFirst({
        where: {
          id: postId,
          deletedAt: null,
          status: "published",
        },
        select: { id: true },
      });
    }

    console.log("DEBUG: Found post:", post);

    if (!post) {
      console.log("DEBUG: No post found with ID/slug:", postId);
      throw new Error("NOT_FOUND");
    }

    return post.id;
  } catch (error) {
    console.error("DEBUG: Error in resolvePostId:", error);
    throw error;
  }
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: postIdParam } = await params;
    const postId = await resolvePostId(postIdParam);
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.log("DEBUG: POST request to comments API");
    const paramsResolved = await params;
    console.log("DEBUG: Params:", paramsResolved);

    const session = await auth();
    console.log(
      "DEBUG: Session:",
      session?.user?.id ? "authenticated" : "not authenticated"
    );
    console.log("DEBUG: User ID:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("DEBUG: No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
      console.log("DEBUG: Request body:", body);
    } catch (error) {
      console.log("DEBUG: Failed to parse JSON:", error);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const payload = createSchema.safeParse(body);

    if (!payload.success) {
      console.log("DEBUG: Validation failed:", payload.error);
      return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
    }

    let postId: string;

    try {
      postId = await resolvePostId(paramsResolved.postId);
      console.log("DEBUG: Resolved postId:", postId);
    } catch (error) {
      console.log("DEBUG: Post resolution failed:", error);
      if (error instanceof Error && error.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      console.error("DEBUG: Unexpected error in post resolution:", error);
      return NextResponse.json({ error: "Failed to resolve post" }, { status: 500 });
    }

    if (payload.data.parentId) {
      try {
        const parent = await prisma.comment.findFirst({
          where: { id: payload.data.parentId, postId },
        });
        if (!parent) {
          return NextResponse.json(
            { error: "Parent comment not found" },
            { status: 404 }
          );
        }
      } catch (error) {
        console.error("DEBUG: Error checking parent comment:", error);
        return NextResponse.json(
          { error: "Failed to validate parent comment" },
          { status: 500 }
        );
      }
    }

    let comment;
    try {
      comment = await prisma.comment.create({
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
      console.log("DEBUG: Comment created successfully:", comment.id);
    } catch (error) {
      console.error("DEBUG: Error creating comment:", error);
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

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
  } catch (error) {
    console.error("DEBUG: Unhandled error in POST comments:", error);
    console.error(
      "DEBUG: Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
