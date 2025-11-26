"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { TagSummary } from "@/types/content";

type TagFilterProps = {
  activeTag?: string;
};

type ApiResponse = {
  tags: TagSummary[];
};

async function fetchTags() {
  const response = await fetch("/api/tags");
  if (!response.ok) {
    throw new Error("Unable to load tags");
  }
  return (await response.json()) as ApiResponse;
}

export function TagFilter({ activeTag }: TagFilterProps) {
  const { data } = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
    staleTime: 60_000,
  });

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--color-foreground)]">
        Filter by tag
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href="/posts"
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            !activeTag
              ? "bg-[var(--color-foreground)] text-white"
              : "border border-[var(--color-border)] text-[var(--color-foreground)]"
          }`}
        >
          All
        </Link>
        {data?.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/posts?tag=${tag.slug}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              activeTag === tag.slug
                ? "bg-[var(--color-foreground)] text-white"
                : "border border-[var(--color-border)] text-[var(--color-foreground)]"
            }`}
          >
            #{tag.name}
            <span className="ml-1 text-[var(--color-muted)]">({tag.postCount ?? 0})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
