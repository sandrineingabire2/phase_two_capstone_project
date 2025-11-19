import Link from "next/link";
import { ProtectedContent } from "@/components/auth/protected-content";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { featuredHighlights, labMilestones, siteMetadata } from "@/lib/site-config";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid-accent rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Lab 1 · Project Setup
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Build a clean Next.js foundation with opinionated layouts, navigation, and
          shared utilities.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          {siteMetadata.description} Use this workspace to test routing ideas, drop in
          components, and keep your folder structure sharp from the start.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
          >
            Explore example pages
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Read about the stack
          </Link>
        </div>
      </section>

      <ResponsiveGrid
        title="Starter components"
        subtitle="Drop new content blocks into the responsive grid without touching layout primitives."
      >
        {featuredHighlights.map((card) => (
          <article key={card.title} className="card-surface border border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.body}</p>
          </article>
        ))}
      </ResponsiveGrid>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Routing milestones</h2>
          <p className="text-sm text-slate-500">
            Each card represents an experiment you can run as you expand the App Router
            tree.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {labMilestones.map((milestone) => (
            <article
              key={milestone.title}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {milestone.status}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {milestone.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{milestone.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-[var(--color-foreground)]">
            Protected sandbox
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Client-side routing checks ensure only signed-in builders can trigger
            sensitive actions.
          </p>
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-[var(--color-border)] bg-white/60 p-4 text-sm text-[var(--color-foreground)]">
          <ProtectedContent>
            <div className="flex flex-col gap-2">
              <p>
                ✅ You are authenticated, so experimental editor features are unlocked.
              </p>
              <Link
                href="/account"
                className="text-sm font-semibold text-[var(--color-foreground)] underline-offset-4 hover:underline"
              >
                Jump to your account →
              </Link>
            </div>
          </ProtectedContent>
        </div>
      </section>
    </div>
  );
}
