//“Use NextAuth’s built-in security guard.”
//Checks if the user is logged in,Runs before the page loads,Stops unauthenticated users
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};


//This code blocks non-logged-in users from accessing /dashboard pages.