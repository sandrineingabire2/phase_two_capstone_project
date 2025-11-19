import Link from "next/link";
import { siteMetadata } from "@/lib/site-config";
import { CurrentTime } from "@/components/footer/current-time";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            © {new Date().getFullYear()} {siteMetadata.name}
          </p>
          <p className="text-sm text-[var(--color-muted)]">{siteMetadata.description}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <CurrentTime />
          <Link
            href={siteMetadata.links.github}
            className="text-sm font-medium text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-foreground)] hover:underline"
          >
            View source
          </Link>
        </div>
      </div>
    </footer>
  );
}
