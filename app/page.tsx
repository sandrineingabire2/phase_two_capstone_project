import Link from "next/link";
import { ProtectedContent } from "@/components/auth/protected-content";
import { featuredHighlights, labMilestones } from "@/lib/site-config";

const overviewSections = [
  {
    title: "WE",
    statements: [
      "Empowering businesses with modern technology.",
      "We design fast, secure, and scalable solutions.",
      "Our focus is clean design and great user experience.",
      "We build products that grow with your needs.",
      "Innovation that makes every process easier.",
    ],
  },
  {
    title: "KNOW",
    statements: [
      "Technology that works for you.",
      "We turn complex ideas into simple digital tools.",
      "Our team delivers reliable and efficient systems.",
      "Every project is built with quality and precision.",
      "Your success is our priority.",
    ],
  },
  {
    title: "DESTINY",
    statements: [
      "Creating the future of digital experiences.",
      "From web development to smart automation.",
      "We build solutions that are powerful and intuitive.",
      "Our technology adapts to your business goals.",
      "Transforming challenges into opportunities.",
    ],
  },
  {
    title: "",
    statements: [
      "Driven by passion for technology.",
      "We craft modern applications with care.",
      "Performance, security, and usability come first.",
      "We help businesses stay ahead of innovation.",
      "Technology made simple and effective.",
    ],
  },
  {
    title: "OUR PURPOSE",
    statements: [
      "Building technology that makes life easier.",
      "We develop tools that save time and deliver results.",
      "Every solution is built with smart engineering.",
      "Clean code, clean design, and clear purpose.",
      "Your vision, powered by our technology.",
    ],
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid-accent rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          ✨ WE
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Empowering businesses with modern technology.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          We design fast, secure, and scalable solutions. Our focus is clean design, great
          user experience, and products that grow with your needs.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
          >
            Explore our work
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Discover who we are
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {overviewSections.map((section) => (
            <article
              key={section.title || "spark"}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                ✨ {section.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {section.statements.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">What we craft</h2>
          <p className="text-sm text-slate-500">
            We transform bold ideas into products that feel fast, secure, and intuitive.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredHighlights.map((card) => (
            <article
              key={card.title}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </p>
              <p className="mt-2 text-sm text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-slate-900">Destiny in motion</h2>
          <p className="text-sm text-slate-500">
            Every milestone reflects our commitment to clean design, precision, and
            performance.
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
