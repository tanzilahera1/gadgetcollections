"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ShoppingBag,
  Truck,
  Phone,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useSession } from "next-auth/react";
import { AccountClaimForm } from "./AccountClaimForm";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="size-24 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 animate-pulse">
            <CheckCircle2 className="size-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            অর্ডার সফল হয়েছে!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            আপনার অর্ডারটি সফলভাবে রিসিভ করা হয়েছে এবং বর্তমানে Pending অবস্থায় আছে। আমাদের প্রতিনিধি খুব শীঘ্রই আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।
          </p>
        </div>

        {orderNumber && (
          <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-6 rounded-3xl inline-block shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              অর্ডার নম্বর
            </p>
            <p className="text-2xl font-black text-primary font-mono tracking-tighter">
              {orderNumber}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/products" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-2xl h-14 px-8 border-primary/20 hover:bg-primary/5"
            >
              <ShoppingBag className="mr-2 size-5" />
              আরো কেনাকাটা করুন
            </Button>
          </Link>
          <Link href="/dashboard/my-orders" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 group"
            >
              অর্ডার স্ট্যাটাস দেখুন
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Account Claiming Form for Guest Users */}
        {!session && orderNumber && (
          <AccountClaimForm orderNumber={orderNumber} />
        )}

        <div className="pt-10 flex items-center justify-center gap-6">
          <Link
            href="#"
            className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <MessageSquare className="size-4" />
            WhatsApp Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">লোডিং...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
