"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PostDeleteButtonProps = {
  postId: string;
  isOwner: boolean;
  onDeleted?: () => void;
};

export function PostDeleteButton({ postId, isOwner, onDeleted }: PostDeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!isOwner) return null;

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setIsDeleting(true);
    onDeleted?.();

    try {
      await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
