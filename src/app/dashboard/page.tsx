import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { SignOutButton } from "@/components/SignOutButton";
import { StudentJoinClassForm } from "@/components/StudentJoinClassForm";
import { TeacherCreateClassForm } from "@/components/TeacherCreateClassForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-12">
      <header>
        <p className="text-sm font-medium text-zinc-500">Phase 2 — Step 2.6</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          You are signed in. Session includes your user id and role for later steps.
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">Name</dt>
            <dd className="text-zinc-900">{session?.user?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Email</dt>
            <dd className="text-zinc-900">{session?.user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Role</dt>
            <dd className="text-zinc-900 capitalize">{session?.user?.role ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">User id</dt>
            <dd className="break-all font-mono text-xs text-zinc-800">
              {session?.user?.id ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      {session?.user?.role === "teacher" ? <TeacherCreateClassForm /> : null}
      {session?.user?.role === "student" ? <StudentJoinClassForm /> : null}

      <div className="flex flex-wrap gap-3">
        <SignOutButton />
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
