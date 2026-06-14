// src/app/(main)/checkout/page.tsx
import { auth } from "@/auth";
import { cookies } from "next/headers";
import Cart from "@/models/Cart";
import Product from "@/models/Product"; // Fix MissingSchemaError
import { dbConnect } from "@/lib/db";
import { CheckoutForm } from "./CheckoutForm";
import { redirect } from "next/navigation";
import { PackageCheck } from "lucide-react";

// Types
import { IPopulatedCartItem, ICart } from "@/types/cart";
import { Document } from "mongoose";

// Helper type for Mongoose returned cart
type PopulatedCartDoc = Document &
  Omit<ICart, "items"> & { items: IPopulatedCartItem[] };

export default async function CheckoutPage() {
  await dbConnect();
  
  // Force Turbopack to keep the Product model import
  if (!Product) throw new Error("Product model missing");

  const session = await auth();
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get("cart_session_id")?.value;

  // ✅ FIX: Type safe cart fetching
  let cartDoc: PopulatedCartDoc | null = null;

  if (session?.user?.id) {
    cartDoc = (await Cart.findOne({ user: session.user.id })
      .populate("items.product")
      .lean()) as unknown as PopulatedCartDoc;
  } else if (guestSessionId) {
    cartDoc = (await Cart.findOne({ sessionId: guestSessionId })
      .populate("items.product")
      .lean()) as unknown as PopulatedCartDoc;
  }

  if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0) {
    redirect("/cart");
  }

  // Calculate subtotal for safety
  const items: IPopulatedCartItem[] = cartDoc.items.map((item) => {
    const product = item.product;
    const price = product.salePrice || product.regularPrice;
    return {
      ...item,
      subtotal: price * item.itemQuantity,
    };
  });

  const total = items.reduce(
    (sum: number, item: IPopulatedCartItem) => sum + item.subtotal,
    0,
  );

  // Serialize for Client Component
  const serializableItems = JSON.parse(JSON.stringify(items));

  return (
    <div className="container mx-auto px-4 py-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <PackageCheck className="size-6" />
            </div>
            <h1 className="text-3xl  font-black tracking-widest">চেকআউট</h1>
          </div>
          <p className="text-muted-foreground  ">
            আপনার পছন্দের প্রিমিয়াম গ্যাজেটগুলো পেতে নিচের তথ্যগুলো পূরণ করুন।
          </p>
        </div>

        <CheckoutForm
          cart={{ items: serializableItems, total }}
          user={{
            name: session?.user?.name || null,
            email: session?.user?.email || null,
            // session user এ phone থাকলে সেটা এখানে পাস করতে পারেন
          }}
        />
      </div>
    </div>
  );
}
