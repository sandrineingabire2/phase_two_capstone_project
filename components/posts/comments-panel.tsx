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
  console.log("DEBUG: Posting comment with postId:", postId, "payload:", payload);

  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("DEBUG: Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("DEBUG: Error response:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP ${response.status}: ${errorText}` };
      }

      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("DEBUG: Success response:", result);
    return result;
  } catch (error) {
    console.error("DEBUG: Fetch error:", error);
    throw error;
  }
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: CommentNode;
  onReply: (id: string, author: string) => void;
}) {
  return (
    <li className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 text-center text-sm font-semibold leading-10 text-slate-900">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{comment.author.name}</p>
          <p className="text-xs text-slate-600">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-800">{comment.content}</p>
      <button
        type="button"
        className="text-xs font-semibold text-blue-600 underline-offset-2 hover:underline hover:text-blue-800 transition-colors"
        onClick={() => onReply(comment.id, comment.author.name)}
      >
        Reply
      </button>
      {comment.replies.length ? (
        <ul className="space-y-3 border-l-2 border-dashed border-slate-300 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CommentsPanel({ postId }: CommentsPanelProps) {
  console.log("DEBUG: CommentsPanel received postId:", postId);
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<{ id: string; author: string } | null>(
    null
  );
  const { data, isLoading, error } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!content.trim()) {
        throw new Error("Comment content is required");
      }
      return postComment(postId, { content: content.trim(), parentId: replyTarget?.id });
    },
    onSuccess: (data) => {
      console.log("DEBUG: Comment posted successfully:", data);
      setContent("");
      setReplyTarget(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) => {
      console.error("DEBUG: Comment post error:", error);
    },
  });

  const comments = data?.comments ?? [];

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Lab 6</p>
        <h2 className="text-xl font-semibold text-slate-900">Comments & replies</h2>
        <p className="text-xs text-slate-500">
          Auth status: {status} | User: {session?.user?.name || "Not logged in"}
        </p>
      </header>
      {status === "authenticated" ? (
        <form
          className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!content.trim()) return;
            mutation.mutate();
          }}
        >
          {replyTarget ? (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs text-slate-700">
              Replying to <span className="font-semibold">{replyTarget.author}</span>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="text-red-600 hover:text-red-800 font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : null}
          <textarea
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Add your perspective..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button
            type="submit"
            disabled={mutation.isPending || !content.trim()}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-slate-800 transition-colors"
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
      {error ? (
        <p className="text-sm text-red-600">Error loading comments: {error.message}</p>
      ) : isLoading ? (
        <p className="text-sm text-slate-600">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-600">Be the first to comment.</p>
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
      {mutation.error && (
        <p className="text-sm text-red-600">
          Error posting comment: {mutation.error.message}
        </p>
      )}
    </section>
  );
}
