const aboutSections = [
  {
    title: "Who we are",
    paragraphs: [
      "We are a team passionate about building modern technology.",
      "Our mission is to create simple, powerful digital solutions.",
      "We focus on clean design, strong performance, and reliability.",
      "Every project is built with care, precision, and innovation.",
      "We exist to make technology work better for everyone.",
    ],
  },
  {
    title: "How we work",
    paragraphs: [
      "We believe technology should be easy and impactful.",
      "Our work combines creativity with smart engineering.",
      "From design to deployment, we deliver quality at every step.",
      "We help businesses grow through modern digital tools.",
      "Your ideas inspire the solutions we build.",
    ],
  },
  {
    title: "Why we build",
    paragraphs: [
      "Founded on a love for innovation and problem-solving.",
      "We turn ideas into functional, user-friendly technology.",
      "Our approach is transparent, flexible, and focused on results.",
      "We design products that evolve with your needs.",
      "We’re here to shape meaningful digital experiences.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">About us</h1>
        <p className="mt-4 text-lg text-slate-600">
          We are a team passionate about building modern technology. Our mission is to
          create simple, powerful digital solutions where clean design, performance, and
          reliability meet.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {aboutSections.map((section) => (
          <article
            key={section.title}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              {section.paragraphs.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Our promise</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">
          We exist to make technology work better for everyone.
        </h3>
        <p className="mt-3 text-slate-600">
          Clean code, clean design, and clear purpose power every solution we deliver.
        </p>
      </section>
    </div>
  );
}
