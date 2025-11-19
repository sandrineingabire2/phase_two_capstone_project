"use client";

import Link from "next/link";
import { useState } from "react";

export type EditablePost = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  createdAt: string;
};

type PostManagerProps = {
  initialPosts: EditablePost[];
};

export function PostManager({ initialPosts }: PostManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [message, setMessage] = useState<string | null>(null);

  async function mutate(
    id: string,
    payload: Record<string, unknown>,
    method: "PUT" | "DELETE"
  ) {
    setMessage(null);
    const response = await fetch(`/api/posts/${id}`, {
      method,
      headers: method === "PUT" ? { "Content-Type": "application/json" } : undefined,
      body: method === "PUT" ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Request failed");
    }

    return response.json().catch(() => ({}));
  }

  async function handleStatus(id: string, status: "draft" | "published") {
    try {
      const data = await mutate(id, { status }, "PUT");
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, status, slug: data.post?.slug ?? post.slug } : post
        )
      );
      setMessage(`Post updated to ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update");
    }
  }

  async function handleDelete(id: string) {
    try {
      await mutate(id, {}, "DELETE");
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setMessage("Post archived.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete");
    }
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No posts yet. Create one from the editor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {message ? <p className="text-sm text-[var(--color-muted)]">{message}</p> : null}
      <ul className="space-y-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-base font-semibold text-[var(--color-foreground)]">
                {post.title}
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
                {post.status} · {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/posts/${post.slug}`}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]"
              >
                View
              </Link>
              <button
                type="button"
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]"
                onClick={() =>
                  handleStatus(
                    post.id,
                    post.status === "published" ? "draft" : "published"
                  )
                }
              >
                Set {post.status === "published" ? "draft" : "published"}
              </button>
              <button
                type="button"
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
