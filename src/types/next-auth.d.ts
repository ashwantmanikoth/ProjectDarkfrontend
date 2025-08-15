import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend User & Session types
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;  // Ensure the user has an ID
    membership?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email?: string;
      name?: string;
      image?: string;
      membership?: string;
    } & DefaultSession["user"]; // Extend the existing user type
  }
}
