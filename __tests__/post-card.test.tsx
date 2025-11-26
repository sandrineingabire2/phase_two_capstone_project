import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/posts/post-card";
import type { PostSummary } from "@/types/content";

const mockPost: PostSummary = {
  id: "1",
  slug: "hello-world",
  title: "Hello World",
  excerpt: "Preview content",
  coverImage: "/window.svg",
  status: "published",
  createdAt: new Date().toISOString(),
  tags: [
    { id: "tag1", name: "Design", slug: "design" },
    { id: "tag2", name: "Next.js", slug: "next-js" },
  ],
  author: { id: "author", name: "Alex Writer", avatarUrl: null },
  reactionTotals: { likes: 2, claps: 3 },
  commentCount: 4,
};

describe("PostCard", () => {
  it("renders post details and tags", () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
    expect(screen.getByText(/preview content/i)).toBeInTheDocument();
    expect(screen.getByText(/#Design/i)).toBeInTheDocument();
    expect(screen.getByText(/#Next\.js/i)).toBeInTheDocument();
    expect(screen.getByText(/👍 2/)).toBeInTheDocument();
    expect(screen.getByText(/💬 4/)).toBeInTheDocument();
  });
});
