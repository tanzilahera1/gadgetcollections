import Link from "next/link";
import Order from "@/models/Order";
import { dbConnect } from "@/lib/db";
import { formatPrice } from "@/lib/priceUtils";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  Package,
  ShieldCheck,
  Smartphone,
  Info,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusUpdater } from "@/components/admin/StatusUpdater";
import { CopyAddressButton } from "@/components/admin/CopyAddressButton";
import Image from "next/image";

import { notFound } from "next/navigation";
import { IOrder } from "@/types/order";

async function getOrder(id: string): Promise<IOrder | null> {
  await dbConnect();
  const order = await Order.findById(id).lean();
  if (!order) return null;
  return JSON.parse(JSON.stringify(order));
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="size-3" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              Order #{order.orderNumber}
            </h2>
            <div className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20 shadow-sm">
              Standard
            </div>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar className="size-4" />
            Placed on{" "}
            {format(new Date(order.createdAt!), "dd MMM, yyyy 'at' hh:mm a")}
          </p>
        </div>

        <StatusUpdater
          orderId={id}
          currentStatus={order.orderStatus || "pending"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Order Items & Pricing */}
        <div className="lg:col-span-2 space-y-8">
          {/* Items List */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-black tracking-tight flex items-center gap-2">
                <Package className="size-5 text-primary" />
                Order Items ({order.items.length})
              </h3>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">
                        Product
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">
                        Price
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-center">
                        Qty
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {order.items.map((item) => (
                      <tr
                        key={item.productSlug}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative size-14 rounded-xl border border-slate-100 bg-white p-1 overflow-hidden shrink-0 shadow-sm">
                              <Image
                                src={item.productImage}
                                alt={item.productTitle}
                                fill
                                sizes="56px"
                                className="object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 line-clamp-1">
                                {item.productTitle}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                SKU: {item.productSku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-slate-900">
                            {formatPrice(item.unitPrice)}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-sm font-black bg-slate-100 px-3 py-1 rounded-lg">
                            x{item.itemQuantity}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="text-sm font-black text-slate-900">
                            {formatPrice(item.unitPrice * item.itemQuantity)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Pricing Summary & Notes */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
              <h3 className="font-black tracking-tight mb-6">
                Payment Summary
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-900">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-500">
                  <span>Shipping Cost</span>
                  <span className="text-slate-900">
                    {formatPrice(order.shippingCost)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between font-bold text-rose-500">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-black text-lg">Total Amount</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <h3 className="font-black tracking-tight mb-4 flex items-center gap-2">
                <Info className="size-5 text-primary" />
                Customer Notes
              </h3>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 min-h-[120px]">
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                  {order.customerNotes
                    ? `"${order.customerNotes}"`
                    : "No special instructions provided by the customer."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customer & Payment Details */}
        <div className="space-y-8">
          {/* Customer Info */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
            <h3 className="font-black tracking-tight mb-6 flex items-center gap-2">
              <User className="size-5 text-primary" />
              Customer Information
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    FULL NAME
                  </p>
                  <p className="text-base font-black text-slate-900">
                    {order.shipping.fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <Phone className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    PHONE NUMBER
                  </p>
                  <p className="text-base font-black text-slate-900">
                    {order.shipping.phone}
                  </p>
                  <button className="text-[10px] font-bold text-primary flex items-center gap-1 mt-1 hover:underline">
                    <Copy className="size-2.5" /> Call Customer
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    SHIPPING ADDRESS
                  </p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {order.shipping.addressLine1}
                    {order.shipping.district && order.shipping.district !== order.shipping.addressLine1 && (
                      <>
                        , <br />
                        {order.shipping.district}
                        {order.shipping.city && order.shipping.city !== order.shipping.district && (
                          <>, {order.shipping.city}</>
                        )}
                      </>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {order.shipping.district?.toLowerCase() === "dhaka"
                        ? "Inside Dhaka"
                        : "Outside Dhaka"}
                    </span>
                    <CopyAddressButton address={`${order.shipping.addressLine1}, ${order.shipping.district || ""}`} />
                  </div>


                </div>
              </div>
            </div>
          </section>

          {/* Payment Details */}
          <section className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-8 text-white relative">
            <div className="absolute top-0 right-0 size-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16" />
            <h3 className="font-black tracking-tight mb-8 flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Payment Verification
            </h3>

            {order.paymentMethod === "mobile" ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-white rounded-lg p-1.5 flex items-center justify-center">
                        <Smartphone className="size-6 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          PROVIDER
                        </p>

                        <p className="text-sm font-black uppercase text-white">
                          {order.paymentProvider}
                        </p>
                      </div>

                    </div>
                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px] font-black uppercase">
                      Unverified
                    </Badge>

                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        TRX ID (TRANSACTION)
                      </p>

                      <p className="text-xl font-mono font-black text-white tracking-widest break-all">
                        {order.transactionId}
                      </p>

                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        SENDER NUMBER
                      </p>

                      <p className="text-base font-black text-white">
                        {order.senderNumber}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-slate-300 italic">
                  <ShieldCheck className="size-4 text-primary" />
                  Please verify the Transaction ID from your{" "}
                  {order.paymentProvider} statement before confirming.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-60">
                <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center">
                  <CreditCard className="size-8 text-slate-400" />
                </div>
                <div>
                  <p className="font-black text-lg">Cash on Delivery</p>
                  <p className="text-xs font-bold text-slate-500">
                    Collect payment upon delivery.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        className,
      )}
    >
      {children}
    </span>
  );
}
