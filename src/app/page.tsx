import { TOPICS } from "@/lib/topics";

/**
 * Step 0 preview: the home page imports TOPICS from `src/lib/topics.ts`.
 * In Phase 3 this list will power a selectable horizontal strip on the dashboard.
 */
export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
        <header>
          <p className="text-sm font-medium text-zinc-500">Step 0 — topics data</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Chinese Speaking Scenarios
          </h1>
          <p className="mt-2 text-zinc-600">
            Topics below come from <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-sm">src/lib/topics.ts</code>.
            Later, students will pick a topic and see matching scenarios.
          </p>
        </header>

        <section aria-label="Topic preview">
          <h2 className="mb-3 text-sm font-medium text-zinc-500">Topic strip (preview, not clickable yet)</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TOPICS.map((topic) => (
              <span
                key={topic.id}
                className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm"
                title={`id: ${topic.id}`}
              >
                {topic.label}
              </span>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
