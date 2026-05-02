// src/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
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
      // এখান থেকে সরাই দিছ
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
            password: z.string().min(8),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        await dbConnect();
        const user = await User.findOne({ email }).lean<
          IUser & { _id: mongoose.Types.ObjectId }
        >();

        // UX উন্নত করার জন্য আলাদা আলাদা এরর
        if (!user) {
          throw new CredentialsSignin("UserNotFound");
        }

        if (!user.password) {
          throw new CredentialsSignin("SocialAccountOnly");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new CredentialsSignin("InvalidPassword");
        }

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
      // প্রথম লগিনে DB থেকে ফ্রেশ ডাটা এবং lastLogin আপডেট
      if (user) {
        await dbConnect();
        const dbUser = await User.findByIdAndUpdate(
          user.id,
          { lastLogin: new Date() },
          { new: true },
        ).lean<IUser & { _id: mongoose.Types.ObjectId }>();

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
    async signIn({ user }) {
      if (user?.id) {
        const { mergeGuestCartToUser } = await import("@/actions/cart");
        await mergeGuestCartToUser(user.id);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
});
