import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthCard } from "@/components/auth/auth-card";

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <AuthCard
        title="Create your account"
        subtitle="Profiles power author attribution and unlock protected editor routes."
      >
        <SignupForm />
        <p className="text-center text-sm text-[var(--color-muted)]">
          Already have access?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-foreground)] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
