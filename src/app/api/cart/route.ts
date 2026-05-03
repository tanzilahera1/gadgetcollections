// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { cookies } from "next/headers";
import type { ICart, IPopulatedCartItem } from "@/types/cart";
import type { IProduct } from "@/types/product";

export const dynamic = "force-dynamic";

// Populate এর পর items এর টাইপ
type PopulatedCart = Omit<ICart, "items"> & {
  items: Array<{
    product: Pick<
      IProduct,
      | "_id"
      | "title"
      | "slug"
      | "thumbnail"
      | "regularPrice"
      | "salePrice"
      | "stockQuantity"
      | "status"
      | "category"
    >;
    itemQuantity: number;
    addedAt: Date;
    variant?: string;
  }>;
};

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    const cookieStore = await cookies();

    let query = {};

    if (session?.user?.id) {
      query = { user: session.user.id };
    } else {
      const guestSessionId = cookieStore.get("cart_session_id")?.value;
      if (!guestSessionId) return NextResponse.json({ items: [], total: 0 });
      query = { sessionId: guestSessionId };
    }

    // ✅ ফিক্স: Generic টাইপ দিয়ে lean
    const cart = await Cart.findOne(query)
      .populate({
        path: "items.product",
        model: Product,
        select:
          "title slug thumbnail regularPrice salePrice stockQuantity status category",
        populate: {
          path: "category",
          model: Category,
          select: "slug",
        },
      })
      .lean<PopulatedCart>();

    if (!cart || !cart.items) return NextResponse.json({ items: [], total: 0 });

    // ✅ ফিক্স: প্রপার টাইপিং
    const items: IPopulatedCartItem[] = cart.items
      .filter((item) => item.product) // 🔥 IMPORTANT
      .map((item) => {
        const product = item.product!;

        const price = product.salePrice ?? product.regularPrice;

        return {
          product: {
            _id: product._id.toString(),
            title: product.title,
            slug: product.slug,
            thumbnail: product.thumbnail,
            regularPrice: product.regularPrice,
            salePrice: product.salePrice,
            stockQuantity: product.stockQuantity,
            status: product.status,
            category: product.category as { slug: string },
          },
          itemQuantity: item.itemQuantity,
          addedAt: item.addedAt,
          variant: item.variant,
          subtotal: price * item.itemQuantity,
        };
      });
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    return NextResponse.json({ items, total });
  } catch (error) {
    console.error("Cart Fetch Error:", error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
