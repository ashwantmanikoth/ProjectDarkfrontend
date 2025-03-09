import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend User & JWT types
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;  // Ensure the user has an ID
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email?: string;
      name?: string;
      image?: string;
    } & DefaultSession["user"]; // Extend the existing user type
  }

  interface JWT {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  }
}
