import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { prisma } from './prisma';
import * as bcrypt from "bcryptjs";

// Define UserRole type
export type UserRole = "ADMIN" | "MUSYRIF" | "WALI";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
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

        // Mock user data for testing
        const mockUsers = [
          {
            id: "1",
            email: "admin@rumahtahfidz.com",
            password:
              "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
            name: "Administrator",
            role: "ADMIN" as UserRole,
            avatar: undefined,
          },
          {
            id: "2",
            email: "musyrif@rumahtahfidz.com",
            password:
              "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
            name: "Ustadz Abdullah",
            role: "MUSYRIF" as UserRole,
            avatar: undefined,
          },
          {
            id: "3",
            email: "wali@rumahtahfidz.com",
            password:
              "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
            name: "Bapak Ahmad",
            role: "WALI" as UserRole,
            avatar: undefined,
          },
        ];

        const user = mockUsers.find((u) => u.email === credentials.email);

        if (!user) {
          return null;
        }

        // For demo purposes, accept 'password' as password
        const isPasswordValid =
          credentials.password === "password" ||
          (await bcrypt.compare(credentials.password, user.password));

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };
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
