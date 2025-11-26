import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getStats(userId: string, viewerId?: string) {
  const [followers, following, isFollowing] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    viewerId
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: { followerId: viewerId, followingId: userId },
          },
        })
      : null,
  ]);

  return {
    followers,
    following,
    isFollowing: Boolean(isFollowing),
  };
}

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  const session = await auth();

  const stats = await getStats(params.userId, session?.user?.id);
  return NextResponse.json({ stats });
}

export async function POST(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id === params.userId) {
    return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: params.userId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: params.userId,
        },
      },
    });
  } else {
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: params.userId,
      },
    });
  }

  const stats = await getStats(params.userId, session.user.id);

  return NextResponse.json({ stats });
}
