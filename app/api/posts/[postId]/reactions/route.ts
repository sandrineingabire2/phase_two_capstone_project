import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const reactionSchema = z.object({
  type: z.enum(["like", "clap"]),
});

async function resolvePostId(postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id: postId }, { slug: postId }],
    },
  });

  if (!post) {
    throw new Error("NOT_FOUND");
  }

  return post.id;
}

async function getTotals(postId: string) {
  const counts = await prisma.reaction.groupBy({
    by: ["type"],
    where: { postId },
    _count: true,
  });

  return counts.reduce(
    (acc, item) => {
      if (item.type === "like") acc.likes = item._count;
      if (item.type === "clap") acc.claps = item._count;
      return acc;
    },
    { likes: 0, claps: 0 }
  );
}

export async function GET(_request: Request, { params }: { params: { postId: string } }) {
  const session = await auth();

  try {
    const postId = await resolvePostId(params.postId);
    const totals = await getTotals(postId);
    let userReactions: Array<"like" | "clap"> = [];

    if (session?.user?.id) {
      const reactions = await prisma.reaction.findMany({
        where: { postId, userId: session.user.id },
        select: { type: true },
      });
      userReactions = reactions.map((reaction) => reaction.type);
    }

    return NextResponse.json({ totals, userReactions });
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

  const payload = reactionSchema.safeParse(await request.json());

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

  const existing = await prisma.reaction.findUnique({
    where: {
      postId_userId_type: {
        postId,
        userId: session.user.id,
        type: payload.data.type,
      },
    },
  });

  if (existing) {
    await prisma.reaction.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.reaction.create({
      data: {
        postId,
        userId: session.user.id,
        type: payload.data.type,
      },
    });
  }

  const totals = await getTotals(postId);

  return NextResponse.json({ totals, toggled: payload.data.type, active: !existing });
}
