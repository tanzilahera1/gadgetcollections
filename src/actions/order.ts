"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import { sendDiscordOrder } from "@/lib/discord";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendMetaEvent, hashPhone } from "@/lib/meta-capi";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";

const CheckoutSchema = z.object({
  name: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষর হওয়া উচিত"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন"),
  district: z.string().min(1, "জেলা সিলেক্ট করুন"),
  addressLine1: z.string().min(5, "বিস্তারিত ঠিকানা দিন"),
  postalCode: z.string().optional(),
  deliveryArea: z.enum(["dhaka", "outside"]),
  paymentMethod: z.enum(["cod", "mobile"]),
  paymentProvider: z.enum(["bkash", "nagad", "rocket"]).optional(),
  senderNumber: z.string().optional(),
  transactionId: z.string().optional(),
  customerNotes: z.string().optional(),
});

function generateOrderNumber() {
  const d = new Date();
  const dateObj =
    d.getFullYear().toString() +
    (d.getMonth() + 1).toString().padStart(2, "0") +
    d.getDate().toString().padStart(2, "0");
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `ORD-${dateObj}-${randomStr}`;
}

export async function createOrder(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validated = CheckoutSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: "ভ্যালিডেশন এরর",
      details: validated.error.flatten(),
    };
  }

  await dbConnect();
  const session = await auth();
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get("cart_session_id")?.value;

  let cart = null;
  if (session?.user?.id) {
    cart = await Cart.findOne({ user: session.user.id }).populate(
      "items.product",
    );
  } else if (guestSessionId) {
    cart = await Cart.findOne({ sessionId: guestSessionId }).populate(
      "items.product",
    );
  }

  if (!cart || cart.items.length === 0) return { error: "Cart is empty" };

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    const price = product.salePrice || product.regularPrice;
    subtotal += price * item.itemQuantity;

    orderItems.push({
      product: product._id,
      variant: item.variant,
      productTitle: product.title,
      productSlug: product.slug,
      productImage: product.images[0]?.url || product.thumbnail,
      unitPrice: price,
      itemQuantity: item.itemQuantity,
      productSku: product.sku,
    });
  }

  const shippingCost = validated.data.deliveryArea === "dhaka" ? 60 : 120;
  const total = subtotal + shippingCost;

  const orderNumber = generateOrderNumber();
  const newOrder = new Order({
    orderNumber,
    user: session?.user?.id || undefined,
    items: orderItems,
    shipping: {
      name: validated.data.name,
      phone: validated.data.phone,
      addressLine1: validated.data.addressLine1,
      district: validated.data.district,
      city: validated.data.district, // fallback to district for city
      postalCode: validated.data.postalCode || "",
    },

    subtotal,
    shippingCost,
    discount: 0,
    total,
    paymentMethod: validated.data.paymentMethod,
    paymentStatus: validated.data.paymentMethod === "cod" ? "pending" : "paid", // Mark as paid if it's mobile for verification
    transactionId: validated.data.transactionId,
    senderNumber: validated.data.senderNumber,
    paymentProvider: validated.data.paymentProvider,
    orderStatus: "pending",
    customerNotes: validated.data.customerNotes,
  });

  await newOrder.save();

  // Clear Cart
  await Cart.deleteOne({ _id: cart._id });

  const headersList = await headers();
  const clientIp =
    headersList.get("x-real-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    "";

  // Meta CAPI
  await sendMetaEvent({
    eventName: "Purchase",
    eventID: crypto.randomUUID(), // Pixel এর সাথে deduplicate করার জন্য
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    userData: {
      ph: [hashPhone(validated.data.phone)],
      client_ip_address: clientIp,
      client_user_agent: headersList.get("user-agent") || "",
      fbp: cookieStore.get("_fbp")?.value,
      fbc: cookieStore.get("_fbc")?.value,
    },
    customData: {
      value: total,
      currency: "BDT",
      content_ids: orderItems.map((i) => i.productSku || i.product.toString()),
      content_type: "product",
      num_items: orderItems.reduce((sum, i) => sum + i.itemQuantity, 0),
    },
  });

  // Notifications
  await sendDiscordOrder(newOrder.toObject());
  await sendTelegramMessage(
    `🛍️ *New Order: ${orderNumber}*\n\n💰 *Total:* ৳${total}\n📞 *Phone:* ${validated.data.phone}`,
  );

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard/my-orders");

  return { orderNumber };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  // Basic admin check (could be refined)
  if (!session?.user) return { error: "Unauthorized" };

  await dbConnect();
  const order = await Order.findById(orderId);
  if (!order) return { error: "Order not found" };

  order.orderStatus = status;

  if (status === "shipped") order.shippedAt = new Date();
  if (status === "delivered") order.deliveredAt = new Date();
  if (status === "cancelled") order.cancelledAt = new Date();

  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/dashboard"); // Revalidate user dashboard too

  return { success: true };
}
