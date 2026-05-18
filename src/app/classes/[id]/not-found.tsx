import Link from "next/link";

export default function ClassNotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Class not found</h1>
      <p className="text-sm text-zinc-600">This class does not exist or the link is invalid.</p>
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
