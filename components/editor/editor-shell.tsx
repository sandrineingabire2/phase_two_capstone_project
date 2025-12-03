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
  tags: string;
};

export function EditorShell() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("<p>Welcome to the Lab 3 editor.</p>");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
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
      setTagsInput(parsed.tags ?? "");
    }
  }, []);

  const persistDraft = useCallback(
    (payload?: Partial<DraftPayload>) => {
      if (typeof window === "undefined") return;
      try {
        const updated: DraftPayload = {
          title,
          summary,
          content,
          tags: tagsInput,
          ...payload,
        };
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        setStatusMessage("Draft saved locally");
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (error) {
        setStatusMessage("Failed to save draft");
        console.error("Draft save error:", error);
      }
    },
    [content, summary, tagsInput, title]
  );

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File too large (max 5MB)");
    }

    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || "Upload failed");
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
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title,
        excerpt: summary,
        content,
        coverUrl: coverUrl ?? "",
        status: "published",
        tags,
      };

      console.log("Publishing post with payload:", payload);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        let errorMessage = `HTTP ${response.status}`;
        try {
          const error = JSON.parse(errorText);
          if (typeof error.error === "string") {
            errorMessage = error.error;
          } else if (typeof error.message === "string") {
            errorMessage = error.message;
          } else {
            errorMessage = JSON.stringify(error);
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(String(errorMessage));
      }

      const result = await response.json();
      console.log("Success response:", result);

      clearDraft();
      setTitle("");
      setSummary("");
      setContent("<p></p>");
      setCoverUrl(null);
      setTagsInput("");
      setStatusMessage("Post published successfully!");

      // Redirect to the new post
      if (result.post?.slug) {
        router.push(`/posts/${result.post.slug}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Publish error:", error);
      setStatusMessage(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setIsPublishing(false);
    }
  }, [clearDraft, content, coverUrl, router, summary, tagsInput, title]);

  const previewMarkup = useMemo(() => ({ __html: content }), [content]);

  return (
    <ProtectedContent>
      <div className="space-y-6">
        <header className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-2xl font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Untitled story"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              placeholder="Short summary for feeds and previews"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Tags (comma separated: design, react, editor)"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
            />
            <RichEditor value={content} onChange={setContent} />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setIsPreviewing((prev) => !prev)}
              >
                {isPreviewing ? "Hide preview" : "Preview"}
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => persistDraft()}
              >
                Save draft locally
              </button>
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
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
                      (prev) =>
                        `${prev}<div style="text-align: center; margin: 20px 0;"><img src="${url}" alt="Story asset" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" /></div>`
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
