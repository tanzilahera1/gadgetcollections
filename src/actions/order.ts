// src/actions/order.ts
"use server";
import { z } from "zod";

import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { sendMetaEvent, getFbCookies } from "@/lib/meta-capi";
import { auth } from "@/auth"; // getServerSession না, auth()
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IProduct } from "@/types/product";
import type { Document } from "mongoose";
import { dbConnect } from "@/lib/db";
import { sendDiscordOrder } from "@/lib/discord";
import { sendTelegramMessage } from "@/lib/telegram";

const CreateOrderSchema = z.object({
  name: z.string().min(3, "নাম কমপক্ষে 3 অক্ষর"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন"),
  isGift: z.boolean().optional(),
  receiverName: z.string().optional(),
  receiverPhone: z.string().optional(),
  addressLine1: z.string().min(5, "ঠিকানা কমপক্ষে 5 অক্ষর"),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  district: z.string().min(2),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "mobile"]),
  transactionId: z.string().optional(),
  customerNotes: z.string().optional(),
});

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${year}${month}${day}-${random}`;
}

export async function createOrder(formData: FormData) {
  const session = await auth(); // getServerSession এর বদলে auth()
  await dbConnect();

  const validated = CreateOrderSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    isGift: formData.get("isGift") === "true",
    receiverName: formData.get("receiverName") || undefined,
    receiverPhone: formData.get("receiverPhone") || undefined,
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2") || undefined,
    city: formData.get("city") || undefined,
    district: formData.get("district"),
    postalCode: formData.get("postalCode") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    transactionId: formData.get("transactionId") || undefined,
    customerNotes: formData.get("customerNotes") || undefined,
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  const userId = session?.user?.id;
  const cookieStore = await cookies(); // Next.js 15+ এ await লাগবে
  const guestSessionId = cookieStore.get("cart_session_id")?.value;

  const cart = await Cart.findOne(
    userId ? { user: userId } : { sessionId: guestSessionId },
  ).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return { error: { cart: ["কার্ট খালি"] } };
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    // any বাদ, প্রপার টাইপ
    const product = item.product as IProduct & Document;
    if (!product || product.status !== "published") {
      return {
        error: {
          cart: [`${product?.title || "প্রোডাক্ট"} এখন আর পাওয়া যাচ্ছে না`],
        },
      };
    }

    if (product.stockQuantity < item.itemQuantity) {
      return {
        error: {
          cart: [`${product.title} স্টকে মাত্র ${product.stockQuantity}টি আছে`],
        },
      };
    }

    const unitPrice = product.salePrice || product.regularPrice;
    subtotal += unitPrice * item.itemQuantity;

    orderItems.push({
      product: product._id,
      productTitle: product.title,
      productSlug: product.slug,
      productImage: product.thumbnail,
      unitPrice,
      itemQuantity: item.itemQuantity,
      productSku: product.sku,
    });
  }

  const shippingCost = subtotal >= 1000 ? 0 : 60;
  const total = subtotal + shippingCost;

  const orderNumber = generateOrderNumber();

  const shippingName = data.isGift && data.receiverName ? data.receiverName : data.name;
  const shippingPhone = data.isGift && data.receiverPhone ? data.receiverPhone : data.phone;

  const order = await Order.create({
    orderNumber,
    user: userId || undefined,
    customerPhone: data.phone,
    items: orderItems,
    shipping: {
      name: shippingName,
      phone: shippingPhone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      district: data.district,
      postalCode: data.postalCode,
    },
    subtotal,
    shippingCost,
    discount: 0,
    total,
    paymentMethod: data.paymentMethod,
    paymentStatus: "pending",
    transactionId: data.transactionId,
    orderStatus: "pending",
    customerNotes: data.customerNotes,
  });

  // Send Notifications
  try {
    await sendDiscordOrder(order);
    
    const telegramMsg = `🛍️ *New Order: ${orderNumber}*\n` +
      `💰 Total: ৳${total}\n` +
      `📞 Phone: ${data.phone}\n` +
      `📍 District: ${data.district}\n` +
      `📦 Items: ${orderItems.length}`;
    await sendTelegramMessage(telegramMsg);
  } catch (err) {
    console.error("Failed to send order notifications:", err);
  }

  for (const item of cart.items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stockQuantity: -item.itemQuantity } },
    );
  }

  await Cart.deleteOne({ _id: cart._id });
  if (guestSessionId) cookieStore.delete("cart_session_id");

  const fbCookies = await getFbCookies();

  await sendMetaEvent({
    eventName: "Purchase",
    eventID: order.orderNumber,
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
    userData: {
      email: session?.user?.email || undefined,
      phone: data.phone,
      fbp: fbCookies.fbp,
      fbc: fbCookies.fbc,
      ct: data.city,
      st: data.district,
      zp: data.postalCode,
      country: "bd",
    },
    customData: {
      value: total,
      currency: "BDT",
      content_ids: orderItems.map((i) => i.productSku),
      content_type: "product",
      num_items: orderItems.reduce((sum, i) => sum + i.itemQuantity, 0),
      order_id: orderNumber,
    },
  });

  revalidatePath("/dashboard/orders");
  return { orderNumber };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth(); // এখানেও auth()
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

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
  revalidatePath("/dashboard");

  return { success: true };
}
