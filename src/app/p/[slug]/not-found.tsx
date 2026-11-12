import Link from "next/link";
import { UserX } from "lucide-react";

export default function AdvisorNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ub-surface-subtle px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ub-surface-subtle">
        <UserX className="h-8 w-8 text-ub-text-tertiary" />
      </div>
      <h1 className="text-lg font-semibold text-ub-text-primary">Advisor profile not found</h1>
      <p className="max-w-sm text-sm text-ub-text-secondary">
        This link may be incorrect, or the profile isn&apos;t published.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg border border-ub-border bg-ub-surface px-4 py-2 text-sm font-medium text-ub-text-secondary transition hover:bg-ub-surface-subtle"
      >
        Go to Unibexs
      </Link>
    </main>
  );
}
