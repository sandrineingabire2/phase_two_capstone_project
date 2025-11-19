const sampleProjects = [
  {
    name: "Content Hub",
    summary: "Marketing site powered by the App Router with nested layouts.",
    tags: ["app router", "mdx", "design system"],
  },
  {
    name: "Data Console",
    summary: "Streaming dashboard and API routes with caching helpers.",
    tags: ["suspense", "api routes", "edge"],
  },
  {
    name: "Mobile Toolkit",
    summary: "Shared components exported to React Native via packages.",
    tags: ["packages", "design tokens"],
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Example projects</h1>
        <p className="mt-2 text-slate-600">
          Start here when you need placeholder screens that showcase the grid container
          pattern. Replace these cards with real data or connect to a CMS.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {sampleProjects.map((project) => (
            <article
              key={project.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{project.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
