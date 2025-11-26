"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PostCard } from "@/components/posts/post-card";
import type { PostSummary } from "@/types/content";

type FeedPageClientProps = {
  isAuthenticated: boolean;
};

type ApiResponse = {
  posts: PostSummary[];
  nextCursor: string | null;
};

type FeedTab = {
  id: "latest" | "recommended" | "following";
  label: string;
  params: Record<string, string>;
  requiresAuth?: boolean;
};

const tabs: FeedTab[] = [
  { id: "latest", label: "Latest", params: { sort: "latest" } },
  {
    id: "recommended",
    label: "Recommended",
    params: { sort: "recommended" },
  },
  {
    id: "following",
    label: "Following",
    params: { filter: "following" },
    requiresAuth: true,
  },
];

async function fetchFeed(tab: FeedTab, cursor?: string) {
  const search = new URLSearchParams({
    limit: "6",
    ...tab.params,
  });

  if (cursor) {
    search.set("cursor", cursor);
  }

  const response = await fetch(`/api/posts?${search.toString()}`);
  if (!response.ok) {
    throw new Error("Unable to fetch feed");
  }
  return (await response.json()) as ApiResponse;
}

export function FeedPageClient({ isAuthenticated }: FeedPageClientProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>(tabs[0]);

  const query = useInfiniteQuery({
    queryKey: ["feed", activeTab.id],
    queryFn: ({ pageParam }) => fetchFeed(activeTab, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !activeTab.requiresAuth || isAuthenticated,
  });

  const posts = useMemo(
    () => query.data?.pages.flatMap((page) => page.posts) ?? [],
    [query.data]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const disabled = tab.requiresAuth && !isAuthenticated;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={disabled}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                activeTab.id === tab.id
                  ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-foreground)]"
              } ${disabled ? "opacity-50" : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab.requiresAuth && !isAuthenticated ? (
        <p className="text-sm text-[var(--color-muted)]">
          Sign in to see posts from authors you follow.
        </p>
      ) : query.isLoading ? (
        <p className="text-sm text-[var(--color-muted)]">Loading feed…</p>
      ) : query.isError ? (
        <p className="text-sm text-red-600">Unable to load feed right now.</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No posts to show yet.</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={`${post.id}-${post.slug}`} post={post} />
            ))}
          </div>
          {query.hasNextPage ? (
            <button
              type="button"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-full border border-[var(--color-border)] px-6 py-2 text-sm font-semibold text-[var(--color-foreground)]"
            >
              {query.isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
