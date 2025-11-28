import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      passwordHash: hashedPassword,
      bio: "A test user for development",
    },
  });

  // Create test tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { name: "JavaScript", slug: "javascript" },
    }),
    prisma.tag.create({
      data: { name: "React", slug: "react" },
    }),
    prisma.tag.create({
      data: { name: "Next.js", slug: "nextjs" },
    }),
  ]);

  // Create test posts
  const post1 = await prisma.post.create({
    data: {
      title: "Getting Started with Next.js",
      slug: "getting-started-with-nextjs",
      excerpt: "Learn the basics of Next.js and build your first application.",
      content: `# Getting Started with Next.js

Next.js is a powerful React framework that makes building web applications easier and more efficient.

## Key Features

- **Server-side rendering** for better performance
- **Static site generation** for blazing fast sites
- **API routes** for backend functionality
- **File-based routing** for intuitive navigation

## Getting Started

To create a new Next.js app, run:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

Your app will be running at http://localhost:3000!`,
      status: "published",
      authorId: user.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "React Hooks Deep Dive",
      slug: "react-hooks-deep-dive",
      excerpt: "Understanding useState, useEffect, and custom hooks.",
      content: `# React Hooks Deep Dive

React Hooks revolutionized how we write React components by allowing us to use state and lifecycle methods in functional components.

## useState Hook

The \`useState\` hook lets you add state to functional components:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect Hook

The \`useEffect\` hook handles side effects:

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

## Custom Hooks

You can create your own hooks to share logic between components.`,
      status: "published",
      authorId: user.id,
    },
  });

  // Link posts to tags
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags[2].id }, // Next.js
      { postId: post1.id, tagId: tags[0].id }, // JavaScript
      { postId: post2.id, tagId: tags[1].id }, // React
      { postId: post2.id, tagId: tags[0].id }, // JavaScript
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("📧 Test user email: test@example.com");
  console.log("🔑 Test user password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
