import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { User as PrismaUser } from "@prisma/client";
import { JWT } from "next-auth/jwt";
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

export interface CustomToken extends JWT {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// Strictly Typed AuthOptions
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
    strategy: "jwt", // Use JWT-based sessions
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
      const headersList = headers();
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

      // Enforce Email Domain Restrictions (Optional)
      // if (!allowedDomains.some(domain => user.email?.endsWith(`@${domain}`))) {
      //   console.warn("Unauthorized Domain:", user.email);
      //   return false; // Deny login for unauthorized domains
      // }

      return true; // Allow login
    },

    async jwt({ token, user, account, profile }) {
      console.log("JWT Callback - Token before:", user);

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      console.log("JWT Callback - Token after:", token);
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
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

