import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import type { UserRole } from "@/models/User";

export const authOptions: NextAuthOptions = {
  //Tell NextAuth what fields your login needs → it builds perfect form instantly!"
  providers: [
    CredentialsProvider({
      name: "Email and password",
      //Auto-builds login form  
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        //"Grab password from form (keep secret)"
        const password = credentials?.password;
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");
        //include hidden password field
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {

    //Ana logs in → gets id: "123" + role: "teacher"

    //**jwt()**: "Put id + role in secret cookie" (server only)

    //**session()**: "Give id + role to Ana's app" (browser can see)

    //our app: useSession() → "Ana is teacher #123! Show teacher dashboard"
    //This code stores the user’s ID and role in a token so the app can remember them after login.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const withRole = user as unknown as { role?: UserRole };
        if (withRole.role) token.role = withRole.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = token.role as UserRole;
      }
      return session;
      //Token remembers who you are. Session shows who you are.
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
