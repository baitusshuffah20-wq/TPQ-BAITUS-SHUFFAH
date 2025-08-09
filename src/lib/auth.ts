import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import * as bcrypt from "bcryptjs";

// Define UserRole type
export type UserRole = "ADMIN" | "MUSYRIF" | "WALI";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.log("❌ User not found:", credentials.email);
            return null;
          }

          if (!user.isActive) {
            console.log("❌ User is not active:", credentials.email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Invalid password for:", credentials.email);
            return null;
          }

          console.log("✅ Login successful:", user.email, "Role:", user.role);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 NextAuth redirect called:", { url, baseUrl });

      // Prevent redirect loops
      if (url.includes("/login")) {
        console.log("🚫 Preventing login redirect loop");
        return `${baseUrl}/dashboard`;
      }

      // If user is trying to access a specific page, redirect there
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        console.log("✅ Redirecting to relative path:", fullUrl);
        return fullUrl;
      }

      // If URL contains callbackUrl, use it
      if (url.includes("callbackUrl=")) {
        try {
          const urlObj = new URL(url);
          const callbackUrl = urlObj.searchParams.get("callbackUrl");
          if (callbackUrl) {
            const decodedUrl = decodeURIComponent(callbackUrl);
            console.log("✅ Using callbackUrl:", decodedUrl);
            return decodedUrl;
          }
        } catch (error) {
          console.error("❌ Error parsing callbackUrl:", error);
        }
      }

      // Default redirect based on URL or baseUrl
      if (url.startsWith(baseUrl)) {
        console.log("✅ Using provided URL:", url);
        return url;
      }

      // Default to dashboard
      const defaultUrl = `${baseUrl}/dashboard`;
      console.log("✅ Using default redirect:", defaultUrl);
      return defaultUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      avatar?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    avatar?: string;
  }
}
