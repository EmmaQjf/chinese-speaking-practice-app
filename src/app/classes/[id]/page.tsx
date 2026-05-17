import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function ClassDetailPlaceholder({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-12">
      <header>
        <p className="text-sm font-medium text-zinc-500">Phase 2 — placeholder</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">Class</h1>
        <p className="mt-2 break-all font-mono text-sm text-zinc-600">id: {id}</p>
        <p className="mt-4 text-sm text-zinc-600">
          Class detail and scenarios will land in later curriculum steps. For now this page
          confirms the link from your dashboard works.
        </p>
      </header>
      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
