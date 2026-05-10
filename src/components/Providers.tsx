//This file lets your app know who is logged in, everywhere.
//“Take my entire app, wrap it in NextAuth’s SessionProvider, and let every child component access login/session information.”
"use client";

import { SessionProvider } from "next-auth/react";

//What is React.ReactNode? It means:
// text
// HTML
// JSX
// another component
// multiple element
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
