"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import type { CommentNode } from "@/types/content";

type CommentsPanelProps = {
  postId: string;
};

async function fetchComments(postId: string) {
  const response = await fetch(`/api/posts/${postId}/comments`);
  if (!response.ok) {
    throw new Error("Unable to load comments");
  }
  return (await response.json()) as { comments: CommentNode[] };
}

async function postComment(
  postId: string,
  payload: { content: string; parentId?: string }
) {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to post comment");
  }

  return response.json();
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: CommentNode;
  onReply: (id: string, author: string) => void;
}) {
  return (
    <li className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[var(--color-surface-muted)] text-center text-sm font-semibold leading-10 text-[var(--color-foreground)]">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            {comment.author.name}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm text-[var(--color-foreground)]">{comment.content}</p>
      <button
        type="button"
        className="text-xs font-semibold text-[var(--color-muted)] underline-offset-2 hover:underline"
        onClick={() => onReply(comment.id, comment.author.name)}
      >
        Reply
      </button>
      {comment.replies.length ? (
        <ul className="space-y-3 border-l border-dashed border-[var(--color-border)] pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommentsPanel({ postId }: CommentsPanelProps) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: string; author: string } | null>(
    null
  );
  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const mutation = useMutation({
    mutationFn: () => postComment(postId, { content, parentId: replyTarget?.id }),
    onSuccess: () => {
      setContent("");
      setReplyTarget(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const comments = data?.comments ?? [];

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Lab 6
        </p>
        <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
          Comments & replies
        </h2>
      </header>
      {status === "authenticated" ? (
        <form
          className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!content.trim()) return;
            mutation.mutate();
          }}
        >
          {replyTarget ? (
            <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-muted)]/60 px-3 py-2 text-xs text-[var(--color-muted)]">
              Replying to {replyTarget.author}
              <button type="button" onClick={() => setReplyTarget(null)}>
                Cancel
              </button>
            </div>
          ) : null}
          <textarea
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-foreground)] focus:border-[var(--color-accent)] focus:outline-none"
            placeholder="Add your perspective..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button
            type="submit"
            disabled={mutation.isPending || !content.trim()}
            className="rounded-full bg-[var(--color-foreground)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {mutation.isPending ? "Posting..." : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          <Link
            href="/login"
            className="font-semibold underline-offset-4 hover:underline"
          >
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
      {isLoading ? (
        <p className="text-sm text-[var(--color-muted)]">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">Be the first to comment.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id, author) => setReplyTarget({ id, author })}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
