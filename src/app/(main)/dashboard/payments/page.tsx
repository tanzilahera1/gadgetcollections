// src/app/(main)/dashboard/payments/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { formatPrice } from "@/lib/priceUtils";
import { format } from "date-fns";
import {
  History,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Payment History | GadgetCollections",
  description: "View your completed and pending payments.",
};

async function getPayments(userId: string) {
  await dbConnect();
  const orders = await Order.find({ user: userId })
    .select("orderNumber total paymentMethod paymentStatus createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(orders));
}

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const payments = await getPayments(session.user.id!);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <History className="size-8 text-primary" />
            Payment History
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Review all your transactions and payment details.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {payments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {payments.map((payment: any, index: number) => {
              const isPaid =
                payment.paymentStatus === "paid" ||
                payment.paymentStatus === "completed";
              return (
                <div
                  key={payment._id}
                  className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "size-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105",
                        isPaid
                          ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                          : "bg-amber-50 text-amber-500 border-amber-100",
                      )}
                    >
                      <CreditCard className="size-6" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                          ORDER #{payment.orderNumber}
                        </h4>
                        <span
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1",
                            isPaid
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-500 text-white",
                          )}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <Clock className="size-3" />
                          )}
                          {payment.paymentStatus || "Pending"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400">
                        {format(
                          new Date(payment.createdAt),
                          "dd MMM yyyy, hh:mm a",
                        )}{" "}
                        • via{" "}
                        <span className="uppercase">
                          {payment.paymentMethod}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                        Amount
                      </p>
                      <p
                        className={cn(
                          "text-xl font-black tracking-tighter",
                          isPaid ? "text-slate-900" : "text-amber-600",
                        )}
                      >
                        {formatPrice(payment.total)}
                      </p>
                    </div>
                    <Link href={`/dashboard/my-orders/${payment._id}`}>
                      <button className="size-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md">
                        <ChevronRight className="size-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <History className="size-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No Transactions Yet
            </h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
              When you make purchases, your payment history will appear here.
            </p>
            <Link href="/products">
              <button className="bg-primary text-white font-black tracking-tight px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
