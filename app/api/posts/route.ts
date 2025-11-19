import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().max(320).optional().or(z.literal("")),
  content: z.string().min(10),
  coverUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
});

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("includeDrafts") === "true";
  const authorId = searchParams.get("authorId");

  const where: Record<string, unknown> = { deletedAt: null };

  if (!includeDrafts) {
    where.status = "published";
  }

  if (authorId) {
    where.authorId = authorId;
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ posts });
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

  const { title, excerpt, content, coverUrl, status } = parsed.data;
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
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
