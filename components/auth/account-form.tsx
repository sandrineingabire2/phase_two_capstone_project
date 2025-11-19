"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileSchema } from "@/lib/validations/auth";

type FormValues = z.infer<typeof profileSchema>;

type AccountFormProps = {
  initialBio: string | null;
  initialAvatarUrl: string | null;
};

export function AccountForm({ initialBio, initialAvatarUrl }: AccountFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: initialBio ?? "",
      avatarUrl: initialAvatarUrl ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(null);
    setError(null);
    const response = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      let message = "Unable to save profile";
      try {
        const payload = await response.json();
        if (typeof payload.error === "string") {
          message = payload.error;
        }
      } catch {
        // ignore
      }
      setError(message);
      return;
    }

    setSuccess("Profile updated");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">Avatar URL</span>
        <input
          type="url"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="https://images.example/avatar.png"
          {...register("avatarUrl")}
        />
        {errors.avatarUrl ? <p className="text-xs text-red-600">{errors.avatarUrl.message}</p> : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">Bio</span>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Share what you're building..."
          {...register("bio")}
        />
        {errors.bio ? <p className="text-xs text-red-600">{errors.bio.message}</p> : null}
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-[var(--color-foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
