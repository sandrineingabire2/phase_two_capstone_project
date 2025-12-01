"use client";

import { useState } from "react";
import { PostCard } from "@/components/posts/post-card";
import type { PostSummary } from "@/types/content";

type PostsListProps = {
  initialPosts: PostSummary[];
  currentUserId?: string;
};

export function PostsList({ initialPosts, currentUserId }: PostsListProps) {
  const [posts, setPosts] = useState(initialPosts);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  if (posts.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No published posts yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDeleted={() => handlePostDeleted(post.id)}
        />
      ))}
    </div>
  );
}
