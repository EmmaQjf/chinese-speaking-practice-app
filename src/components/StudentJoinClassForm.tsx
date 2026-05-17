"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { notifyClassesChanged } from "@/components/MyClassesList";

type JoinResult =
  | { ok: true; message: string; className?: string }
  | { ok: false; message: string };

export function StudentJoinClassForm() {
  const [result, setResult] = useState<JoinResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    event.preventDefault();
    setResult(null);
    setIsSubmitting(true);

    const formData = new FormData(form);
    const payload = { code: String(formData.get("joinCode") ?? "") };

    try {
      const response = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      //natch API result 
      let data: {
        ok?: boolean;
        message?: string;
        class?: { name?: string };
      } | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        setResult({
          ok: false,
          message: `Server returned non-JSON (status ${response.status}). First bytes: ${raw.slice(0, 120)}`,
        });
        return;
      }

      if (!response.ok || !data?.ok) {
        setResult({
          ok: false,
          message: data?.message ?? "Could not join class. Try again.",
        });
        return;
      }

      setResult({
        ok: true,
        message: data.message ?? "Joined!",
        className: data.class?.name,
      });
      form.reset();
      notifyClassesChanged();
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
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Join a class</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Enter the join code your teacher shared (letters and numbers, no spaces needed).
      </p>

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="joinCode" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Join code
          </label>
          <input
            id="joinCode"
            name="joinCode"
            type="text"
            required
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="e.g. ABC12XY3"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm uppercase tracking-wider outline-none ring-0 transition focus:border-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {isSubmitting ? "Joining…" : "Join class"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {result.message}
            {result.ok && result.className ? (
              <span className="mt-1 block font-medium">Class: {result.className}</span>
            ) : null}
          </p>
        </div>
      )}
    </section>
  );
}
