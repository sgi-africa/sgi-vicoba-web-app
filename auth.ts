/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SERVER_URI } from "@/constants/constant";
import { ZodError } from "zod"
import { signInSchema } from "@/lib/zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          // Validate credentials with Zod
          const { email, password } = signInSchema.parse(credentials);

          const response = await axios.post(`${SERVER_URI}/api/v1/auth/login`, {
            email,
            password,
          });

          const { accessToken, user } = response.data;

          return {
            id: String(user.id),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.systemRole,
            phone: user.phone,
            accessToken,
            memberships: user.memberships,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error("Invalid input");
          }

          console.error("Login error:", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/login",
  },

  trustHost: true,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.phone = user.phone;
        token.memberships = user.memberships;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
        session.user.accessToken = token.accessToken as string;
        session.user.memberships = token.memberships as any[];
      }

      return session;
    },
  }
});