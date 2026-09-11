import Link from "next/link";
import { UserX } from "lucide-react";

export default function AdvisorNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <UserX className="h-8 w-8 text-slate-400" />
      </div>
      <h1 className="text-lg font-semibold text-slate-900">Advisor profile not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        This link may be incorrect, or the profile isn&apos;t published.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Go to Unibexs
      </Link>
    </main>
  );
}
