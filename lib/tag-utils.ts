import { prisma } from "@/lib/prisma";
import { formatTagName, slugify } from "@/lib/utils";

export async function syncTags(postId: string, tags: string[] | undefined) {
  if (!tags) return;
  const sanitized = Array.from(
    new Map(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => {
          const slug = slugify(tag);
          return [slug, { slug, name: formatTagName(tag) }];
        })
    ).values()
  ).filter((tag) => tag.slug.length > 1);

  if (sanitized.length === 0) {
    await prisma.postTag.deleteMany({ where: { postId } });
    return;
  }

  await prisma.postTag.deleteMany({
    where: {
      postId,
      tag: { slug: { notIn: sanitized.map((tag) => tag.slug) } },
    },
  });

  for (const tag of sanitized) {
    const tagRecord = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: { slug: tag.slug, name: tag.name },
    });

    await prisma.postTag.upsert({
      where: { postId_tagId: { postId, tagId: tagRecord.id } },
      update: {},
      create: { postId, tagId: tagRecord.id },
    });
  }
}
