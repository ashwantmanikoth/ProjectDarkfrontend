import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Session } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "express-rate-limit";
import { User as PrismaUser } from "@prisma/client";

const prisma = new PrismaClient();

// Strict Rate Limiter Middleware
const limiter = rateLimit({
  windowMs:  1000, // 15 minutes
  max: 5, // Maximum 5 login attempts per window
  keyGenerator: (req) => req.ip || "unknown",
  handler: (_, res) => {
    return res.status(429).json({ error: "Too many login attempts. Try again later." });
  },
});

// Allowed email domains (Optional)
// const allowedDomains = ["example.com", "yourdomain.com"];

import { JWT } from "next-auth/jwt";

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

      // Apply Rate Limiting
      try {
        await new Promise((resolve, reject) => limiter({} as NextApiRequest, {} as NextApiResponse, resolve));
      } catch (err) {
        console.warn("Rate limit exceeded:", user.email);
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
        token.id = user.id 
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      console.log("JWT Callback - Token after:", token);
      return token;
    },
    // async session({ session, token}: { session: Session, token: JWT & CustomToken }): Promise<Session> {
    //   console.log("Session Callback - Token:", token);

    //   if (!token?.id) {
    //     console.error("Session Error: Token ID is undefined!");
    //     return session;
    //   }

    //   session.user.id = token.id;
    //   session.user.email = token.email;
    //   session.user.name = token.name;
    //   session.user.image = token.picture;

    //   return session;
    // },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV !== "production",
};

// Secure API Route for Authenticat
export const handler = NextAuth(authOptions);

export {handler as GET,handler as POST};

