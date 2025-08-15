import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { User as PrismaUser } from "@prisma/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Rate limiting using a simple in-memory store
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return true;
  }

  userLimit.count++;
  return false;
}

// Allowed email domains (Optional)
// const allowedDomains = ["example.com", "yourdomain.com"];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  // cookies: {
  //   sessionToken: {
  //     name: process.env.NODE_ENV === "production"
  //       ? "__Secure-next-auth.session-token"
  //       : "next-auth.session-token",
  //     options: {
  //       // httpOnly: true, 
  //       // sameSite: "strict",
  //       // secure: process.env.NODE_ENV === "development",
  //     },
  //   },
  // },
  callbacks: {
    async signIn({ user, account, profile, email }) {
      console.log(`SignIn Attempt - User: ${user.email}`);

      // Get IP from headers
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") || "unknown";

      // Apply Rate Limiting
      if (isRateLimited(ip)) {
        console.warn("Rate limit exceeded:", ip);
        return false;
      }

      // Block users flagged as "blocked" in the database
      const dbUser: PrismaUser | null = await prisma.user.findUnique({
        where: { email: user.email ?? undefined },
      });

      if (dbUser?.blocked) {
        console.warn("Blocked User Attempt:", user.email);
        return false;
      }

      // If this is a new user, allow sign in
      if (!dbUser) {
        return true;
      }

      // Check if user already has an account with a different provider
      const existingAccounts = await prisma.account.findMany({
        where: {
          userId: dbUser.id,
        },
      });

      // If user has existing accounts with different providers
      if (existingAccounts.length > 0) {
        const existingProvider = existingAccounts[0].provider;
        if (existingProvider !== account?.provider) {
          // Return false with a custom error message
          throw new Error(`An account with this email already exists. Please sign in with ${existingProvider}.`);
        }
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email ?? "";
        session.user.name = user.name ?? "";
        session.user.image = user.image ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  debug: process.env.NODE_ENV !== "production",
};

// Secure API Route for Authenticat
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

