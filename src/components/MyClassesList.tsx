"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/** Fired after create/join so this list refetches without a full page reload. */
export const CLASSES_CHANGED_EVENT = "classes:changed";

export function notifyClassesChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLASSES_CHANGED_EVENT));
  }
}

export type ClassListItem = {
  id: string;
  name: string;
  joinCode?: string;
  role: string;
};

export function MyClassesList() {
  const [classes, setClasses] = useState<ClassListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setClasses(null);
    try {
      const response = await fetch("/api/classes");
      const raw = await response.text();
      let data: { ok?: boolean; classes?: ClassListItem[]; message?: string } | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        setError(`Could not read server response (status ${response.status}).`);
        setClasses([]);
        return;
      }
      if (!response.ok || !data?.ok) {
        setError(data?.message ?? "Could not load classes.");
        setClasses([]);
        return;
      }
      //If data.classes is an array → use it
      //Otherwise → use an empty array  
      setClasses(Array.isArray(data.classes) ? data.classes : []);
    } catch {
      setError("Network error. Check your connection and try again.");
      setClasses([]);
    }
  }, []);

  useEffect(() => {
    void load(); //void → ignore the returned Promise
    const onChanged = () => void load();
    window.addEventListener(CLASSES_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(CLASSES_CHANGED_EVENT, onChanged);
  }, [load]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">My classes</h2>
      <p className="mt-1 text-sm text-zinc-600">Classes you teach or have joined.</p>

      {classes === null ? (
        <p className="mt-4 text-sm text-zinc-500">Loading…</p>
      ) : error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : classes.length === 0 ? (
        <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          No classes yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
          {classes.map((c) => (
            <li key={c.id} className="py-3">
              <div className="min-w-0">
                <Link
                  href={`/classes/${c.id}`}
                  className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                >
                  {c.name}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-500 capitalize">
                  Your role in class: {c.role}
                </p>
                {c.joinCode ? (
                  <p className="mt-1 font-mono text-xs text-zinc-600">
                    Join code: <span className="font-semibold tracking-wider">{c.joinCode}</span>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
