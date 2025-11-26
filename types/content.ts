export type TagSummary = {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
};

export type AuthorSummary = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export type ReactionTotals = {
  likes: number;
  claps: number;
};

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  status: "draft" | "published";
  createdAt: string;
  tags: TagSummary[];
  author: AuthorSummary;
  reactionTotals: ReactionTotals;
  commentCount: number;
};

export type PostDetail = PostSummary & {
  content: string;
  updatedAt: string;
};

export type CommentNode = {
  id: string;
  content: string;
  createdAt: string;
  author: AuthorSummary;
  parentId?: string | null;
  replies: CommentNode[];
};

export type FollowStats = {
  followers: number;
  following: number;
  isFollowing: boolean;
};
