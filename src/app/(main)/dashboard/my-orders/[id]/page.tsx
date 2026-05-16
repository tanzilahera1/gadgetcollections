import { auth } from "@/auth";
import Order from "@/models/Order";
import { dbConnect } from "@/lib/db";
import { formatPrice } from "@/lib/priceUtils";
import { format } from "date-fns";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
  Info,
  Calendar,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import type { IOrderSerializable, IOrderItem } from "@/types/order";

const STATUS_STEPS = [
  { id: "pending", label: "Pending", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
];

async function getOrder(
  id: string,
  userId: string,
): Promise<IOrderSerializable | null> {
  await dbConnect();
  const order = await Order.findOne({ _id: id, user: userId }).lean();
  if (!order) return null;
  return JSON.parse(JSON.stringify(order));
}

export default async function UserOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const order = await getOrder(id, session.user.id!);

  if (!order) notFound();

  const currentStatus = order.orderStatus || "pending";
  const currentStepIndex = STATUS_STEPS.findIndex(
    (step) => step.id === currentStatus,
  );

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8 sm:mb-10 space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="size-3" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Order ID: {order.orderNumber}
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Calendar className="size-4" />
              Placed on {format(new Date(order.createdAt), "dd MMM, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-primary/5 border border-primary/20 rounded-2xl">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-sm font-black text-primary uppercase tracking-widest">
              {order.orderStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Progress & Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Tracker */}
          {currentStatus !== "cancelled" && currentStatus !== "returned" ? (
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-12">
              <h3 className="text-lg font-black tracking-tight mb-8 sm:mb-12 flex items-center gap-2">
                <Truck className="size-6 text-primary" />
                Delivery Status
              </h3>

              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-4.5 w-full h-1 bg-slate-100 rounded-full" />
                <div
                  className="absolute left-0 top-4.5 h-1 bg-primary rounded-full transition-all duration-1000"
                  style={{
                    width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                  }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  return (
                    <div
                      key={step.id}
                      className="relative z-10 flex flex-col items-center gap-4"
                    >
                      <div
                        className={cn(
                          "size-10 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                          isCompleted
                            ? "bg-primary border-white text-white shadow-lg shadow-primary/20 scale-110"
                            : "bg-white border-slate-100 text-slate-300",
                        )}
                      >
                        <step.icon className="size-4" />
                      </div>
                      <div className="text-center">
                        <p
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                            isCompleted ? "text-slate-900" : "text-slate-400",
                          )}
                        >
                          {step.label}
                        </p>
                        {isCompleted && (
                          <p className="text-[8px] font-bold text-primary/60 uppercase">
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="rounded-[2.5rem] border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4 bg-rose-50">
              <div className="size-16 rounded-full flex items-center justify-center bg-rose-100 text-rose-600">
                {currentStatus === "cancelled" ? (
                  <XCircle className="size-8" />
                ) : (
                  <AlertCircle className="size-8" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-rose-600">
                  Order{" "}
                  {currentStatus === "cancelled" ? "Cancelled" : "Returned"}
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  This order has been{" "}
                  {currentStatus === "cancelled"
                    ? "cancelled"
                    : "returned and processed"}
                  .
                </p>
              </div>
            </section>
          )}

          {/* Items List */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-black tracking-tight flex items-center gap-2">
                <Package className="size-5 text-primary" />
                Package Items ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items.map((item: IOrderItem, idx: number) => (
                <div
                  key={idx}
                  className="p-5 sm:p-8 flex items-center gap-6 hover:bg-slate-50/30 transition-colors"
                >
                  <div className="relative size-20 rounded-2xl border border-slate-100 bg-white p-2 overflow-hidden shadow-sm shrink-0">
                    <Image
                      src={item.productImage}
                      alt={item.productTitle}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-base font-black text-slate-900 leading-tight">
                      {item.productTitle}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      SKU: {item.productSku}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-sm font-black text-primary">
                        {formatPrice(item.unitPrice)}
                      </p>
                      <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest text-slate-500">
                        Qty: {item.itemQuantity}
                      </span>
                    </div>
                  </div>
                  <p className="hidden sm:block text-lg font-black text-slate-900 tracking-tighter">
                    {formatPrice(item.unitPrice * item.itemQuantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Pricing Footer */}
            <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center sm:text-left">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                    SUBTOTAL
                  </p>
                  <p className="text-sm font-bold">
                    {formatPrice(order.subtotal)}
                  </p>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                    SHIPPING
                  </p>
                  <p className="text-sm font-bold">
                    {formatPrice(order.shippingCost)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">
                    GRAND TOTAL
                  </p>
                  <p className="text-3xl font-black tracking-tighter">
                    {formatPrice(order.total)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Shipping & Help */}
        <div className="space-y-8">
          {/* Shipping Info */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
            <h3 className="font-black tracking-tight flex items-center gap-3 border-b border-slate-50 pb-4">
              <MapPin className="size-5 text-primary" />
              Shipping Address
            </h3>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  NAME
                </p>
                <p className="text-base font-black text-slate-900">
                  {order.shipping.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  CONTACT NUMBER
                </p>
                <p className="text-base font-black text-slate-900">
                  {order.shipping.phone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  ADDRESS
                </p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                  {order.shipping.addressLine1}, <br />
                  {order.shipping.district}, {order.shipping.city}
                </p>
              </div>
            </div>
          </section>

          {/* Payment Status */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h3 className="font-black tracking-tight flex items-center gap-3">
              <CreditCard className="size-5 text-primary" />
              Payment Status
            </h3>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  METHOD
                </p>
                <span className="text-xs font-black uppercase text-slate-900">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  STATUS
                </p>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="size-3" />
                  {order.paymentStatus || "Paid"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-2xl text-[10px] font-bold text-slate-500 leading-relaxed italic">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              Your transaction is secured with 256-bit SSL encryption.
            </div>
          </section>

          {/* Help Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 size-48 bg-primary/20 rounded-full blur-[80px] -mb-24 -mr-24 transition-all group-hover:scale-125" />
            <h3 className="font-black tracking-tight mb-4 flex items-center gap-2">
              <Info className="size-5 text-primary" />
              Need Help?
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Having trouble with your order? Our support team is available
              24/7.
            </p>
            <button className="w-full bg-white text-slate-900 font-black tracking-tight px-6 py-4 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
