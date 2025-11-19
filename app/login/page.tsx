import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <AuthCard
        title="Sign in"
        subtitle="Secure routes and personalized content unlock once you're authenticated."
      >
        <LoginForm />
        <p className="text-center text-sm text-[var(--color-muted)]">
          Need an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[var(--color-foreground)] underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
