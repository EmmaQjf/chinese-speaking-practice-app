"use client";
//NextAuth is a library that handles login, sessions, and user authentication so you don’t have to build security systems yourself.
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
    >
      Sign out
    </button>
  );
}
