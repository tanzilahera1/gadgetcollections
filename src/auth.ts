// src/auth.ts
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { clientPromise, dbConnect } from "@/lib/db";
import User from "@/models/User";
import { IUser } from "@/types/user";
import bcrypt from "bcryptjs";
import { z } from "zod";
import mongoose from "mongoose";
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  // @ts-expect-error - Auth.js v5 এ টাইপ নাই কিন্তু রানটাইমে কাজ করে
  allowDangerousEmailAccountLinking: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // এখান থেকে সরাই দিছি
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await dbConnect();
        const user = await User.findOne({ email }).lean<
          IUser & { _id: mongoose.Types.ObjectId }
        >();

        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, account }) {
      // প্রথম লগিনে DB থেকে ফ্রেশ ডাটা
      if (user) {
        await dbConnect();
        const dbUser = await User.findById(user.id).lean<
          IUser & { _id: mongoose.Types.ObjectId }
        >();
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.fullName = dbUser.fullName;
        }
      }

      // Google দিয়ে লগিন করলে role ডিফল্ট 'user'
      if (account?.provider === "google" && !token.role) {
        token.role = "user";
      }

      // OAuth হলে ইমেইল ভেরিফাইড ধরে নাও
      if (account?.provider === "google") {
        token.emailVerified = new Date();
      }

      // প্রোফাইল আপডেটে সেশন রিফ্রেশ
      if (trigger === "update") {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email }).lean<IUser>();
        if (dbUser) {
          token.role = dbUser.role;
          token.fullName = dbUser.fullName;
          token.name = dbUser.fullName;
          token.image = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin";
        session.user.name = token.fullName as string;
      }
      return session;
    },
  },
  events: {
    // ✅ ফিক্স 2: isNewUser চেক বাদ। সবসময় মার্জ করো
    async signIn({ user, account }) {
      const { mergeGuestCartToUser } = await import("@/actions/cart");
      await mergeGuestCartToUser();
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
});
