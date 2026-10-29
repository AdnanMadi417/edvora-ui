import Link from "next/link";

// UI-only mode: no sign-in. Each area runs as a mock user of its role
// (config/mockSession.ts).
const AREAS = [
  { href: "/admin/applications", label: "Admin" },
  { href: "/partner/applications", label: "Partner" },
  { href: "/account-manager/applications", label: "Account Manager" },
  { href: "/reviewer/advisors", label: "Reviewer" },
  { href: "/data-entry/knowledge-hub", label: "Data Entry" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-md">
        <h1 className="text-h5 font-bold text-slate-900">Choose an area</h1>
        <p className="mt-1 text-p2 text-slate-500">UI preview. No sign-in required.</p>
        <ul className="mt-5 space-y-2">
          {AREAS.map((area) => (
            <li key={area.href}>
              <Link
                href={area.href}
                className="block rounded-md border border-slate-200 px-4 py-2.5 text-p2 font-medium text-slate-700 transition hover:border-accent hover:text-accent"
              >
                {area.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
