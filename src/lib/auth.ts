import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

declare module "next-auth" {
  interface User {
    role?: string;
    plan?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      plan: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          console.log("[Auth] User not found or no password:", credentials.email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) {
          console.log("[Auth] Invalid password for:", credentials.email);
          return null;
        }

        console.log("[Auth] Login success for:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          plan: user.plan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: any) {
      // Allow credentials sign-in without adapter interference
      if (account?.provider === "credentials") {
        return true;
      }
      // Allow OAuth sign-in (adapter handles account linking)
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.plan = user.plan || "FREE";
      }

      // Auto-promote first user to ADMIN — only on initial sign-in
      if (user && token.role !== "ADMIN") {
        try {
          const adminExists = await prisma.user.findFirst({
            where: { role: "ADMIN" },
            select: { id: true },
          });
          if (!adminExists) {
            await prisma.user.update({
              where: { id: token.id as string },
              data: { role: "ADMIN" },
            });
            token.role = "ADMIN";
          }
        } catch (error) {
          console.error("[Auth] Admin promotion error:", error);
        }
      }

      // Refresh role/plan from DB only on explicit session update
      if (trigger === "update" && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, plan: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.plan = dbUser.plan;
          }
        } catch (error) {
          console.error("[Auth] Session update error:", error);
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
});
