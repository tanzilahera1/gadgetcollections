// src/app/api/cart/count/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Cart from "@/models/Cart";
import { cookies } from "next/headers";
import type { ICart } from "@/types/cart";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    const cookieStore = await cookies();

    let count = 0;

    if (session?.user?.id) {
      const cart = await Cart.findOne({ user: session.user.id })
        .select("items")
        .lean<Pick<ICart, "items">>();

      count = cart?.items?.length ?? 0;
    } else {
      const guestSessionId = cookieStore.get("cart_session_id")?.value;
      if (guestSessionId) {
        const cart = await Cart.findOne({ sessionId: guestSessionId })
          .select("items")
          .lean<Pick<ICart, "items">>();

        count = cart?.items?.length ?? 0;
      }
    }

    return NextResponse.json({ count, totalQuantity: count });
  } catch {
    return NextResponse.json({ count: 0, totalQuantity: 0 });
  }
}
