//“When someone tries to log in or check who is logged in, use NextAuth to handle it.”
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
