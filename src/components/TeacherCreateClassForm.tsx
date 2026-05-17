"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { notifyClassesChanged } from "@/components/MyClassesList";

//This code defines the two possible outcomes of creating a class: either it succeeds (with a join code) or it fails (with an error message).
type CreateClassResult =
  | { ok: true; message: string; joinCode: string }
  | { ok: false; message: string };

export function TeacherCreateClassForm() {
  const [result, setResult] = useState<CreateClassResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
//handling form submitting 
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    event.preventDefault();
    setResult(null);
    setCopied(false);
    setIsSubmitting(true);
    //get the data from form -Creates a simple object
    const formData = new FormData(form);
    const payload = { name: String(formData.get("className") ?? "") };
    //Send data to the server
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      //The server replies with text.  The code carefully tries to turn it into usable data.
      const raw = await response.text();
      //Prepare a place to store the parsed result
      let data: {
        ok?: boolean;
        message?: string;
        class?: { joinCode?: string };
      } | null = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {

//         JSON.parse(raw) will crash if:

// The server returned:
// An HTML error page
// Plain text
// A crash message
// Or the server broke and returned garbage

        setResult({
          ok: false,
          message: `Server returned non-JSON (status ${response.status}). First bytes: ${raw.slice(0, 120)}`,
        });
        return;
      }
      
      //“If the server says something went wrong…” Then show an error message to the user.
      //response.ok → “Did the request reach the server?”
      //data.ok → “Did the server say the action succeeded?”
      //“If the server failed OR the server says the operation failed,
//then treat this as an error.”
      if (!response.ok || !data?.ok) {
        setResult({
          ok: false,
          message: data?.message ?? "Could not create class. Try again.",
        });
        return;
      }
       
      const joinCode = data.class?.joinCode;
      if (!joinCode) {
        setResult({ ok: false, message: "Server response missing join code." });
        return;
      }

      setResult({
        ok: true,
        message: data.message ?? "Class created.",
        joinCode,
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

  async function copyJoinCode() {
    if (result?.ok !== true) return;
    try {
      await navigator.clipboard.writeText(result.joinCode);//Copies the join code to the clipboard
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000); //Shows “Copied!” for 2 seconds
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Create a class</h2>
      <p className="mt-1 text-sm text-zinc-600">
        Students will join with the join code shown after you create the class.
      </p>

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="className" className="mb-1.5 block text-sm font-medium text-zinc-700">
            Class name
          </label>
          <input
            id="className"
            name="className"
            type="text"
            required
            maxLength={120}
            placeholder="e.g. Period 3 — Chinese II"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Create class"}
        </button>
      </form>

      {result && (
        <div className="mt-4 space-y-3">
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {result.message}
          </p>

          {result.ok && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
              <span className="text-xs font-medium text-zinc-500">Join code</span>
              <code className="text-sm font-semibold tracking-wider text-zinc-900">{result.joinCode}</code>
              <button
                type="button"
                onClick={copyJoinCode}
                className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
