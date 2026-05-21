import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { TeacherCreateScenarioForm } from "@/components/TeacherCreateScenarioForm";
import { authOptions } from "@/lib/authOptions";
import { assertClassAccess } from "@/lib/assertClassAccess";
import connectDB from "@/lib/mongodb";

type Props = { params: Promise<{ id: string }> };

export default async function ClassDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  await connectDB();

  const access = await assertClassAccess(session.user.id, session.user.role, id);

  if (!access.ok) {
    if (access.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-12">
        <header>
          <p className="text-sm font-medium text-zinc-500">Phase 2 — Step 2.9</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
            Access denied
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{access.message}</p>
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

  const { class: classDoc, roleInClass } = access;

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-12">
      <header>
        <p className="text-sm font-medium text-zinc-500">Phase 3 — Step 3.5</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {classDoc.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 capitalize">
          Your role in this class: {roleInClass}
        </p>
        {roleInClass === "teacher" ? (
          <p className="mt-2 font-mono text-sm text-zinc-700">
            Join code:{" "}
            <span className="font-semibold tracking-wider">{classDoc.joinCode}</span>
          </p>
        ) : null}
        <p className="mt-4 text-sm text-zinc-600">
          Topic strip and scenario list come in steps 3.6–3.8. Only class members can view this
          page.
        </p>
      </header>

      {roleInClass === "teacher" ? <TeacherCreateScenarioForm classId={id} /> : null}

      <Link
        href="/dashboard"
        className="inline-flex w-fit items-center rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
      >
        Back to dashboard
      </Link>
    </div>
    );
}
