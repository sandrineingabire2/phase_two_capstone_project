import Link from "next/link";

const tooling = [
  {
    name: "Next.js 16 + App Router",
    detail: "Server components, layouts, and streaming-ready routes.",
  },
  { name: "TypeScript + ESLint", detail: "Strict mode with auto-generated types." },
  {
    name: "Tailwind CSS v4",
    detail: "Utility-first styling with custom tokens in globals.",
  },
  { name: "Husky-ready", detail: "Add pre-commit hooks without reconfiguring lint." },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">About this lab</h1>
        <p className="mt-4 text-slate-600">
          This starter keeps the focus on routing and layout experiments. The header,
          footer, and grid container live in shared components so feature teams can work
          inside `app/` without copy-pasting structure.
        </p>
        <p className="mt-4 text-slate-600">
          Explore the file tree to see how reusable pieces are grouped under{" "}
          <code className="rounded bg-slate-100 px-2 py-1 text-sm">components/</code> and
          supporting utilities live in{" "}
          <code className="rounded bg-slate-100 px-2 py-1 text-sm">lib/</code> and{" "}
          <code className="rounded bg-slate-100 px-2 py-1 text-sm">hooks/</code>.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Stack summary</h2>
        <ul className="mt-6 space-y-4">
          {tooling.map((tool) => (
            <li key={tool.name} className="rounded-xl border border-slate-100 p-4">
              <p className="text-base font-semibold text-slate-900">{tool.name}</p>
              <p className="text-sm text-slate-600">{tool.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Next step</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">
          Add a feature-specific route group.
        </h3>
        <p className="mt-3 text-slate-600">
          Duplicate this pattern for additional labs or spin up API routes, metadata, and
          loading states under dedicated directories.
        </p>
        <div className="mt-4">
          <Link
            href="/projects"
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            View the sample project listing
          </Link>
        </div>
      </section>
    </div>
  );
}
