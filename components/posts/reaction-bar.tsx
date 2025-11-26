"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ReactionTotals } from "@/types/content";

type ReactionBarProps = {
  postId: string;
};

type ApiResponse = {
  totals: ReactionTotals;
  userReactions: Array<"like" | "clap">;
};

async function fetchReactions(postId: string) {
  const response = await fetch(`/api/posts/${postId}/reactions`);
  if (!response.ok) {
    throw new Error("Unable to load reactions");
  }
  return (await response.json()) as ApiResponse;
}

async function toggleReaction(postId: string, type: "like" | "clap") {
  const response = await fetch(`/api/posts/${postId}/reactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    throw new Error("Unable to update reaction");
  }

  return response.json() as Promise<{ totals: ReactionTotals }>;
}

export function ReactionBar({ postId }: ReactionBarProps) {
  const { status } = useSession();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["reactions", postId],
    queryFn: () => fetchReactions(postId),
  });

  const mutation = useMutation({
    mutationFn: (type: "like" | "clap") => toggleReaction(postId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", postId] });
    },
  });

  const totals = data?.totals ?? { likes: 0, claps: 0 };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white/60 p-4 text-sm font-semibold text-[var(--color-foreground)]">
      <button
        type="button"
        onClick={() => mutation.mutate("like")}
        disabled={status !== "authenticated" || mutation.isPending}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition ${
          (data?.userReactions ?? []).includes("like")
            ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white"
            : "border-[var(--color-border)] bg-white/80"
        } ${status !== "authenticated" ? "opacity-60" : ""}`}
      >
        👍 {totals.likes}
      </button>
      <button
        type="button"
        onClick={() => mutation.mutate("clap")}
        disabled={status !== "authenticated" || mutation.isPending}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition ${
          (data?.userReactions ?? []).includes("clap")
            ? "border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white"
            : "border-[var(--color-border)] bg-white/80"
        } ${status !== "authenticated" ? "opacity-60" : ""}`}
      >
        👏 {totals.claps}
      </button>
      {status !== "authenticated" ? (
        <p className="text-xs text-[var(--color-muted)]">Sign in to react</p>
      ) : null}
    </div>
  );
}
