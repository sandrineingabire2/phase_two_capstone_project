"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/editor/rich-editor";
import { ProtectedContent } from "@/components/auth/protected-content";

const LOCAL_STORAGE_KEY = "lab3-editor-draft";

type DraftPayload = {
  title: string;
  summary: string;
  content: string;
};

export function EditorShell() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("<p>Welcome to the Lab 3 editor.</p>");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as DraftPayload;
      setTitle(parsed.title ?? "");
      setSummary(parsed.summary ?? "");
      setContent(parsed.content ?? "");
    }
  }, []);

  const persistDraft = useCallback(
    (payload?: Partial<DraftPayload>) => {
      if (typeof window === "undefined") return;
      const updated: DraftPayload = {
        title,
        summary,
        content,
        ...payload,
      };
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setStatusMessage("Draft saved locally");
    },
    [content, summary, title]
  );

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = (await response.json()) as { url: string };
    return data.url;
  }, []);

  const handlePublish = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      setStatusMessage("Title and body are required before publishing.");
      return;
    }

    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt: summary,
          content,
          coverUrl: coverUrl ?? "",
          status: "published",
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to publish");
      }

      clearDraft();
      setTitle("");
      setSummary("");
      setContent("<p></p>");
      setCoverUrl(null);
      setStatusMessage("Post published. Redirecting...");
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setIsPublishing(false);
    }
  }, [clearDraft, content, coverUrl, router, summary, title]);

  const previewMarkup = useMemo(() => ({ __html: content }), [content]);

  return (
    <ProtectedContent>
      <div className="space-y-6">
        <header className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Lab 3 · Editor
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">
            Create a new entry
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Format rich content, upload assets, preview output, and publish to the shared
            feed.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <input
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-2xl font-semibold text-[var(--color-foreground)] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="Untitled story"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] focus:border-[var(--color-accent)] focus:outline-none"
              rows={3}
              placeholder="Short summary for feeds and previews"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
            <RichEditor value={content} onChange={setContent} />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                onClick={() => setIsPreviewing((prev) => !prev)}
              >
                {isPreviewing ? "Hide preview" : "Preview"}
              </button>
              <button
                type="button"
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                onClick={() => persistDraft()}
              >
                Save draft locally
              </button>
              <button
                type="button"
                className="rounded-full bg-[var(--color-foreground)] px-4 py-2 text-sm font-semibold text-white"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            </div>
            {statusMessage ? (
              <p className="text-sm text-[var(--color-muted)]">{statusMessage}</p>
            ) : null}
          </div>

          <aside className="space-y-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Media & settings
            </h2>
            <label className="block space-y-2 text-sm text-[var(--color-foreground)]">
              <span>Cover image</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await handleImageUpload(file);
                    setCoverUrl(url);
                    setContent(
                      (prev) => `${prev}<p><img src=\"${url}\" alt=\"Story asset\" /></p>`
                    );
                  } catch (error) {
                    setStatusMessage(
                      error instanceof Error ? error.message : "Upload error"
                    );
                  }
                }}
              />
              {coverUrl ? (
                <div className="relative h-32 w-full overflow-hidden rounded-xl">
                  <Image
                    src={coverUrl}
                    alt="Cover preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <p className="text-xs text-[var(--color-muted)]">
                  Uploads are saved to /public/uploads for local preview.
                </p>
              )}
            </label>
            {isPreviewing ? (
              <div>
                <div className="mb-2 text-sm font-semibold text-[var(--color-muted)]">
                  Live preview
                </div>
                <article
                  className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white/80 p-4 text-[var(--color-foreground)] leading-relaxed"
                  dangerouslySetInnerHTML={previewMarkup}
                />
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </ProtectedContent>
  );
}
