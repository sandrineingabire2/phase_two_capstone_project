"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { FollowStats } from "@/types/content";

type FollowButtonProps = {
  userId: string;
};

type ApiResponse = {
  stats: FollowStats;
};

async function fetchFollow(userId: string) {
  const response = await fetch(`/api/profile/${userId}/follow`);
  if (!response.ok) {
    throw new Error("Unable to load follow stats");
  }
  return (await response.json()) as ApiResponse;
}

async function toggleFollow(userId: string) {
  const response = await fetch(`/api/profile/${userId}/follow`, { method: "POST" });
  if (!response.ok) {
    throw new Error("Unable to update follow state");
  }
  return response.json() as Promise<ApiResponse>;
}

export function FollowButton({ userId }: FollowButtonProps) {
  const { status, data: session } = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["follow", userId],
    queryFn: () => fetchFollow(userId),
  });

  const mutation = useMutation({
    mutationFn: () => toggleFollow(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow", userId] }),
  });

  if (session?.user?.id === userId) {
    return (
      <div className="text-sm text-[var(--color-muted)]">
        Followers {data?.stats.followers ?? 0} · Following {data?.stats.following ?? 0}
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Link
        href="/login"
        className="rounded-full bg-[var(--color-foreground)] px-4 py-2 text-sm font-semibold text-white"
      >
        Sign in to follow
      </Link>
    );
  }

  const isFollowing = data?.stats.isFollowing ?? false;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          isFollowing
            ? "bg-white text-[var(--color-foreground)]"
            : "bg-[var(--color-foreground)] text-white"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
      <span className="text-xs text-[var(--color-muted)]">
        Followers {data?.stats.followers ?? 0} · Following {data?.stats.following ?? 0}
      </span>
    </div>
  );
}
