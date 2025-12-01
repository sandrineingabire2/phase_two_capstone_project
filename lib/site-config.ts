const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteMetadata = {
  name: "DailySpark",
  description: "",
  author: "XP Accelerator Team",
  siteUrl,
  ogImage: `${siteUrl}/api/og?title=Lab%20Studio`,
  links: {
    github: "https://github.com/",
  },
};

export const navigationLinks = [
  { href: "/", label: "Overview" },
  { href: "/feed", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/posts", label: "Posts" },
  { href: "/editor", label: "Editor" },
];

export const featuredHighlights = [
  {
    title: "App Router Ready",
    body: "Route groups, nested layouts, and streaming are first-class citizens in this workspace.",
  },
  {
    title: "Typed from Day One",
    body: "TypeScript, ESLint, and Prettier-compatible formatting keep the developer experience sharp.",
  },
  {
    title: "Design System Friendly",
    body: "A responsive grid, shared components, and folder structure keep UI work tidy.",
  },
];

export const labMilestones = [
  {
    title: "Project Setup",
    status: "Complete",
    description: "Create Next.js project with app router, Tailwind, and linting.",
  },
  {
    title: "Layout System",
    status: "Complete",
    description: "Establish global header, footer, and shared grid container.",
  },
  {
    title: "Rich Content",
    status: "Complete",
    description: "Add the Lab 3 editor with media uploads, preview, and drafts.",
  },
  {
    title: "Posts CRUD",
    status: "Complete",
    description: "Full lifecycle APIs, listing, detail pages, and media handling.",
  },
  {
    title: "Social + Discovery",
    status: "Complete",
    description: "Feeds, search, tagging, and social interactions for discovery.",
  },
  {
    title: "Quality & SEO",
    status: "Complete",
    description: "Strict typing, automated tests, and Open Graph metadata.",
  },
];
