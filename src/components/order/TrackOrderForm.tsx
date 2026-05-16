// src/components/order/TrackOrderForm.tsx
"use client";
import { useState, useRef } from "react";
import {
  Search,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/priceUtils";
import { toast } from "sonner";
import type { IOrder } from "@/types/order";

const STAGES = [
  { id: "pending", label: "Order Placed", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "On the Way", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
];

// Track এর জন্য শুধু যা দরকার তা Pick করা
type TrackedOrder = Pick<
  IOrder,
  | "orderNumber"
  | "orderStatus"
  | "paymentMethod"
  | "total"
  | "items"
  | "subtotal"
  | "shippingCost"
  | "discount"
  | "couponCode"
  | "createdAt"
> & {
  shipping: {
    name: string;
    address: string;
    city: string;
    district: string;
    phone: string;
  };
};

export function TrackOrderForm() {
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleTrack = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!orderId.trim()) {
      toast.error("আপনার Order ID দিন");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/order/track?orderId=${encodeURIComponent(orderId.trim())}`,
      );
      const data = (await res.json()) as {
        success: boolean;
        order?: TrackedOrder;
        error?: string;
      };

      if (data.success && data.order) {
        setOrder(data.order);
        // Smooth scroll to center in viewport with proper offset
        setTimeout(() => {
          const element = resultRef.current;
          if (element) {
            const elementRect = element.getBoundingClientRect();
            const headerOffset = 40; // Space for header
            const viewportCenter = window.innerHeight / 2;
            const scrollTarget =
              elementRect.top +
              window.scrollY -
              headerOffset -
              viewportCenter / 2;

            window.scrollTo({
              top: scrollTarget,
              behavior: "smooth",
            });
          }
        }, 100);
      } else {
        toast.error(data.error ?? "Order খুঁজে পাওয়া যায়নি");
        setOrder(null);
      }
    } catch {
      toast.error("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string): number => {
    return STAGES.findIndex((s) => s.id === status);
  };

  return (
    <div className="space-y-12" suppressHydrationWarning>
      {/* Search Section */}
      <form
        onSubmit={handleTrack}
        className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5"
      >
        <div className="space-y-2 text-center mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            পাবলিক পোর্টাল
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            আপনার শিপমেন্ট ট্র্যাক করুন
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Order ID
            </label>
            <Input
              placeholder="আপনার Order ID লিখুন (যেমন: ORD-2024-5432 বা 202451215432)"
              className="h-14 rounded-2xl bg-slate-50 border-2 border-slate-200 font-bold text-lg focus-visible:ring-primary/20 focus-visible:border-primary transition-all px-6"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-blue-700">
                আপনার Order ID এর সাথে বা ছাড়া &quot;ORD-&quot; prefix এবং
                ড্যাশ দিয়ে লিখতে পারবেন। সব format এ কাজ করবে!
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          {loading ? (
            "খুঁজছি..."
          ) : (
            <>
              <Search className="size-4" />
              স্ট্যাটাস দেখুন
            </>
          )}
        </Button>
      </form>

      {/* Result Section */}
      {order && (
        <div
          ref={resultRef}
          className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 size-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                  বর্তমান অগ্রগতি
                </p>
                <h3 className="text-3xl font-black tracking-tight">
                  Order #{order.orderNumber}
                </h3>
                <p className="text-slate-400 font-bold text-sm">
                  নাম: {order.shipping.name}
                </p>
              </div>
              <div className="text-left md:text-right space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                  মোট পরিমাণ
                </p>
                <p className="text-3xl font-black text-white">
                  {formatPrice(order.total)}
                </p>
                <span className="inline-block px-3 py-1 rounded-lg bg-white/10 text-[9px] font-black uppercase tracking-widest border border-white/5">
                  পদ্ধতি: {order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-16 relative">
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/10 hidden md:block" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 overflow-hidden">
                {STAGES.map((stage, idx) => {
                  const isActive = getStatusIndex(order.orderStatus) >= idx;
                  const isCurrent = order.orderStatus === stage.id;

                  return (
                    <div
                      key={stage.id}
                      className="relative flex md:flex-col items-center gap-4 md:text-center group"
                    >
                      <div
                        className={cn(
                          "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10",
                          isActive
                            ? "bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                            : "bg-white/5 text-white/20",
                        )}
                      >
                        <stage.icon
                          className={cn("size-6", isCurrent && "animate-pulse")}
                        />
                      </div>
                      <div className="space-y-1">
                        <p
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest transition-colors",
                            isActive ? "text-white" : "text-white/20",
                          )}
                        >
                          {stage.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                ডেলিভারি ঠিকানা
              </h4>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">
                  {order.shipping.address}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {order.shipping.city}, {order.shipping.district}
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                সহায়তা কেন্দ্র
              </h4>
              <p className="text-sm font-medium text-slate-500">
                আপনার Order নিয়ে সাহায্য লাগবে? আমাদের সাপোর্ট টিম সবসময়
                প্রস্তুত।
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-primary font-black uppercase text-[10px] tracking-widest gap-2"
              >
                যোগাযোগ করুন <ChevronRight className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
