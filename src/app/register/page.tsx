"use client";

import { useState } from "react";

type RegisterResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export default function RegisterPage() {
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? ""),
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setResult({
          ok: false,
          message: data.message ?? "Registration failed. Please check your inputs.",
        });
        return;
      }

      setResult({
        ok: true,
        message: data.message ?? "Success",
      });
      event.currentTarget.reset();
    } catch {
      setResult({
        ok: false,
        message: "Network error. Check your dev server and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-zinc-500">Phase 1 - Step 1.2</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
            Create account
          </h1>
          <p className="mt-2 text-sm text-zinc-600">This step posts to /api/register.</p>
        </header>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="student@school.org"
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Use at least 8 characters"
              minLength={8}
              required
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-zinc-700">Role</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
                <input type="radio" name="role" value="teacher" defaultChecked />
                Teacher
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
                <input type="radio" name="role" value="student" />
                Student
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          {result && (
            <p
              className={`rounded-lg border px-3 py-2 text-sm ${
                result.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {result.message}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
