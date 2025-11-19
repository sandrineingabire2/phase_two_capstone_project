type ResponsiveGridProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function ResponsiveGrid({ title, subtitle, children }: ResponsiveGridProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
