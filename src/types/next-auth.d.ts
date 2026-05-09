//This file tells TypeScript that your user and token include id and role.

import type { DefaultSession } from "next-auth";
//This imports the default user shape
import type { UserRole } from "@/models/User";

//You are not changing NextAuth’s code.You are extending its types.
declare module "next-auth" {
  interface Session {
    //DefaultSession-Take the original NextAuth user fields.”name,email,image
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
    };
  }
}

//“I want to add fields to the JWT token.”
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    //Why ? (optional)?,Before login → token is empty,After login → token gets filled
  }
}
