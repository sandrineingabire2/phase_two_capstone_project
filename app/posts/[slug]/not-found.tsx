export default function NotFound() {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
        Posts
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
        Post not found
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        The requested story may be draft or archived.
      </p>
    </div>
  );
}
