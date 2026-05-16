import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID প্রয়োজন" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Extract only digits from input (removes #, ORD, -, spaces, etc.)
    const inputDigits = orderId.replace(/\D/g, "");

    if (!inputDigits || inputDigits.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID এর ফরম্যাট সঠিক নয়",
        },
        { status: 400 },
      );
    }

    // Find all orders and compare digits
    const allOrders = await Order.find({}).lean();

    const matchedOrder = allOrders.find((order) => {
      // Extract digits from stored order number
      const dbDigits = order.orderNumber.replace(/\D/g, "");
      return dbDigits === inputDigits;
    });

    if (!matchedOrder) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order খুঁজে পাওয়া যায়নি। আপনার Order ID চেক করে আবার চেষ্টা করুন।",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, order: matchedOrder });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
