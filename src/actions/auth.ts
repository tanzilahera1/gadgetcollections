"use server";

import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signOut } from "@/auth";

const RegisterSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUp(formData: z.infer<typeof RegisterSchema>) {
  try {
    const validated = RegisterSchema.safeParse(formData);
    if (!validated.success) {
      return { error: "Validation failed", details: validated.error.flatten() };
    }

    const { fullName, email, password } = validated.data;

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "user",
    });

    await newUser.save();

    return {
      success: true,
      message: "Registration successful! You can now login.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Internal server error. Please try again." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
