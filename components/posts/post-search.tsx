"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { PostSummary } from "@/types/content";

type ApiResponse = {
  posts: PostSummary[];
};

async function fetchPosts(query: string) {
  const response = await fetch(`/api/posts?q=${encodeURIComponent(query)}&limit=5`);
  if (!response.ok) {
    throw new Error("Unable to search posts");
  }
  return (await response.json()) as ApiResponse;
}

export function PostSearch() {
  const [value, setValue] = useState("");
  const debounced = useDebouncedValue(value, 300);

  const enabled = debounced.trim().length >= 2;
  const { data, isFetching, error } = useQuery({
    queryKey: ["post-search", debounced],
    queryFn: () => fetchPosts(debounced),
    enabled,
  });

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Search posts
      </label>
      <input
        type="search"
        placeholder="Search by title, tag, or summary"
        className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-accent)] focus:outline-none"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {error ? (
        <p className="mt-2 text-xs text-red-600">Unable to search right now.</p>
      ) : null}
      {enabled && data?.posts.length ? (
        <ul className="absolute left-0 right-0 z-20 mt-2 space-y-1 rounded-2xl border border-[var(--color-border)] bg-white shadow-lg">
          {data.posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.slug}`}
                className="block px-4 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]/60"
              >
                {post.title}
                <span className="ml-2 text-xs uppercase text-[var(--color-muted)]">
                  {post.tags
                    .slice(0, 2)
                    .map((tag) => `#${tag.name}`)
                    .join(" ")}
                </span>
              </Link>
            </li>
          ))}
          {isFetching ? (
            <li className="px-4 py-2 text-xs text-[var(--color-muted)]">Updating…</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
