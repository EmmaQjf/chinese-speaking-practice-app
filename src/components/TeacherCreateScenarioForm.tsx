"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { SCENARIO_LEVELS } from "@/lib/scenarioLevels";
import { TOPICS } from "@/lib/topics";

/** Fired after a scenario is created so lists can refetch (used in 3.7+). */
export const SCENARIOS_CHANGED_EVENT = "scenarios:changed";

export function notifyScenariosChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SCENARIOS_CHANGED_EVENT));
  }
}

type CreateScenarioResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

type Props = {
  classId: string;
};

export function TeacherCreateScenarioForm({ classId }: Props) {
  const [result, setResult] = useState<CreateScenarioResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    event.preventDefault();
    setResult(null);
    setIsSubmitting(true);

    const formData = new FormData(form);
    const payload = {
      topicId: String(formData.get("topicId") ?? ""),
      level: String(formData.get("level") ?? ""),
      promptEnglish: String(formData.get("promptEnglish") ?? ""),
    };

    try {
      const response = await fetch(`/api/classes/${classId}/scenarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data: { ok?: boolean; message?: string } | null = null;
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
          message: data?.message ?? "Could not create scenario. Try again.",
        });
        return;
      }

      setResult({
        ok: true,
        message: data.message ?? "Scenario created.",
      });
      form.reset();
      notifyScenariosChanged();
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
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Create scenario</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Add a speaking prompt for students. Pick a topic and level.
      </p>

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="topicId" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Topic
          </label>
          <select
            id="topicId"
            name="topicId"
            required
            defaultValue={TOPICS[0]?.id}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
          >
            {TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="level" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Level
          </label>
          <select
            id="level"
            name="level"
            required
            defaultValue="2"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
          >
            {SCENARIO_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="promptEnglish"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            English prompt
          </label>
          <textarea
            id="promptEnglish"
            name="promptEnglish"
            required
            rows={4}
            maxLength={2000}
            placeholder="e.g. Describe your morning routine in detail."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create scenario"}
        </button>
      </form>

      {result && (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {result.message}
        </p>
      )}
    </section>
  );
}
