"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations/auth";

const schema = signupSchema;
type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      avatarUrl: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      let message = "Unable to create account";
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

    reset();
    router.push("/login?from=signup");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Full name
        </span>
        <input
          type="text"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Alex Studio"
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">Email</span>
        <input
          type="email"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Password
        </span>
        <input
          type="password"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Avatar URL
        </span>
        <input
          type="url"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="https://images.example/avatar.png"
          {...register("avatarUrl")}
        />
        {errors.avatarUrl ? (
          <p className="text-xs text-red-600">{errors.avatarUrl.message}</p>
        ) : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          Short bio
        </span>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="Share what you build..."
          {...register("bio")}
        />
        {errors.bio ? <p className="text-xs text-red-600">{errors.bio.message}</p> : null}
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
