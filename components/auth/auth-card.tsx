type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
          Lab 2 · Authentication
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-foreground)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
