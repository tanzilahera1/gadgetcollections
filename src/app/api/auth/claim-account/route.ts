import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, orderNumber } = await req.json();

    if (!email || !password || !orderNumber) {
      return NextResponse.json(
        { error: "ইমেইল, পাসওয়ার্ড এবং অর্ডার নম্বর আবশ্যক" },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে একটি একাউন্ট ইতিমধ্যে আছে। দয়া করে অন্য ইমেইল ব্যবহার করুন অথবা লগিন করুন।" },
        { status: 400 }
      );
    }

    // 2. Fetch the order
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: "অর্ডার খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    // 3. Create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: order.shipping.name || "Customer",
      email: email,
      password: hashedPassword,
      phone: order.customerPhone || order.shipping.phone,
      role: "user",
    });

    // 4. Link the order to the new user
    order.user = newUser._id;
    await order.save();

    return NextResponse.json({ success: true, message: "একাউন্ট তৈরি সফল হয়েছে" });
  } catch (error: any) {
    console.error("Account claiming error:", error);
    return NextResponse.json(
      { error: "সার্ভার এরর, দয়া করে আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}
