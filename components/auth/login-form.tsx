"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";

const schema = loginSchema;
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/account");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">Email</span>
        <input
          type="email"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </label>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">Password</span>
        <input
          type="password"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-[var(--color-accent)] focus:outline-none"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-contrast)] transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
