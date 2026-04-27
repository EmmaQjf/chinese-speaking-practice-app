export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6">
          <p className="text-sm font-medium text-zinc-500">Phase 1 - Step 1.1</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
            Log in
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            UI only for now. We will connect this form to real auth in a later step.
          </p>
        </header>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-zinc-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="teacher@school.org"
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
              placeholder="Enter your password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Log in
          </button>
        </form>
      </main>
    </div>
  );
}
