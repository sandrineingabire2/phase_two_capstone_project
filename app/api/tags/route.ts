import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  const tags = await prisma.tag.findMany({
    where: query
      ? {
          name: {
            contains: query,
          },
        }
      : undefined,
    orderBy: [{ name: "asc" }],
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return NextResponse.json({
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postCount: tag._count.posts,
    })),
  });
}
