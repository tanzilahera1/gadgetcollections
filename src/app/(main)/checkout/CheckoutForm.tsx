// src\app\(main)\checkout\CheckoutForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowRight,
  Check,
  PackageCheck,
  User,
  CreditCard,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/lib/priceUtils";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { IPopulatedCartItem } from "@/types/cart";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

const CheckoutSchema = z
  .object({
    fullName: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষর হওয়া উচিত"),
    phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন"),
    addressLine1: z.string().min(5, "বিস্তারিত ঠিকানা দিন"),
    deliveryArea: z.enum(["dhaka", "outside"] as const),
    paymentMethod: z.enum(["cod", "mobile"] as const),
    paymentProvider: z.enum(["bkash", "nagad", "rocket"] as const).optional(),
    senderNumber: z.string().optional(),
    transactionId: z.string().optional(),
    customerNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "mobile") {
        return (
          !!data.paymentProvider && !!data.senderNumber && !!data.transactionId
        );
      }
      return true;
    },
    {
      message: "মোবাইল পেমেন্টের জন্য সব তথ্য দিন",
      path: ["transactionId"],
    },
  );

type CheckoutValues = z.infer<typeof CheckoutSchema>;

interface CheckoutFormProps {
  cart: {
    items: IPopulatedCartItem[];
    total: number;
  };
  user?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

const PAYMENT_ACCOUNTS = {
  bkash: {
    name: "bKash",
    number: "01742413416",
    logo: "/payment-method-logo/bkash.svg",
    color: "text-[#D12053]",
  },
  nagad: {
    name: "Nagad",
    number: "01742413416",
    logo: "/payment-method-logo/nagad.svg",
    color: "text-[#EF4136]",
  },
  rocket: {
    name: "Rocket",
    number: "01742413416",
    logo: "/payment-method-logo/rocket.png",
    color: "text-[#8C3494]",
  },
} as const;

type ProviderKey = keyof typeof PAYMENT_ACCOUNTS;

export function CheckoutForm({ cart, user }: CheckoutFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      fullName: user?.name || "",
      phone: user?.phone || "",
      deliveryArea: "dhaka",
      paymentMethod: "cod",
      paymentProvider: "bkash",
    },
  });

  const deliveryArea = watch("deliveryArea");
  const paymentMethod = watch("paymentMethod");
  const paymentProvider = watch("paymentProvider") as ProviderKey;

  const deliveryCharge = deliveryArea === "dhaka" ? 60 : 120;
  const grandTotal = cart.total + deliveryCharge;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data: CheckoutValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      (Object.keys(data) as Array<keyof CheckoutValues>).forEach((key) => {
        const value = data[key];
        if (value) formData.append(key, value);
      });
      formData.append(
        "district",
        data.deliveryArea === "dhaka" ? "Dhaka" : "Outside Dhaka",
      );

      const result = await createOrder(formData);
      if (result && "orderNumber" in result) {
        setOrderId(result.orderNumber as string);
        setShowSuccessModal(true);
        // Immediately clear cart badge & details from React Query cache
        queryClient.invalidateQueries({ queryKey: ["cart-count"] });
        queryClient.invalidateQueries({ queryKey: ["cart-details"] });
      }
    } catch {
      toast.error("কিছু ভুল হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid lg:grid-cols-12 gap-6 lg:gap-10"
      >
        {/* Left Side: Information */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* Section 1: Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <User className="size-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-widest">
                কন্টাক্ট ইনফরমেশন
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-card/20 p-5 sm:p-7 rounded-2xl border border-border/40">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  নাম
                </Label>
                <Input
                  {...register("fullName")}
                  placeholder="আপনার পুরো নাম"
                  className="h-12 rounded-xl bg-background/50 text-base"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive font-bold">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  মোবাইল নম্বর
                </Label>
                <Input
                  {...register("phone")}
                  placeholder="01XXXXXXXXX"
                  className="h-12 rounded-xl bg-background/50 text-base"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive font-bold">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  বিস্তারিত ঠিকানা
                </Label>
                <Textarea
                  {...register("addressLine1")}
                  placeholder="জেলা: মুন্সীগঞ্জ, উপজেলা: শ্রীনগর, . . ."
                  className="min-h-25 rounded-xl bg-background/50 resize-none text-base"
                />
                {errors.addressLine1 && (
                  <p className="text-xs text-destructive font-bold">
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="size-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-widest">
                ডেলিভারি এরিয়া
              </h2>
            </div>
            <RadioGroup
              onValueChange={(v: "dhaka" | "outside") =>
                setValue("deliveryArea", v)
              }
              className="grid sm:grid-cols-2 gap-4"
            >
              {[
                {
                  id: "dhaka" as const,
                  label: "ঢাকার ভেতর",
                  sub: "Home Delivery",
                  price: 60,
                },
                {
                  id: "outside" as const,
                  label: "ঢাকার বাইরে",
                  sub: "Courier Service",
                  price: 120,
                },
              ].map((area) => (
                <div
                  key={area.id}
                  onClick={() => setValue("deliveryArea", area.id)}
                  className={cn(
                    "relative flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer overflow-hidden",
                    deliveryArea === area.id
                      ? "border-primary bg-primary/3 ring-1 ring-primary/20 shadow-sm"
                      : "border-border/40 bg-card/20 hover:border-primary/20",
                  )}
                >
                  {deliveryArea === area.id && (
                    <div className="absolute top-0 right-0 bg-primary text-white p-1 rounded-bl-xl shadow-md animate-in fade-in zoom-in duration-300">
                      <Check className="size-3.5 stroke-[4px]" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-5 rounded-full border-2 flex items-center justify-center transition-all",
                        deliveryArea === area.id
                          ? "border-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      <div
                        className={cn(
                          "size-2.5 rounded-full bg-primary transition-all",
                          deliveryArea === area.id ? "scale-100" : "scale-0",
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-base leading-none">
                        {area.label}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1.5 tracking-wider">
                        {area.sub}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-primary">
                    ৳{area.price}
                  </span>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Section 3: Payment */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="size-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-widest">
                পেমেন্ট মেথড
              </h2>
            </div>
            <div className="grid gap-4">
              {/* COD */}
              <div
                onClick={() => setValue("paymentMethod", "cod")}
                className={cn(
                  "relative flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer overflow-hidden group",
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/3"
                    : "border-border/40 bg-card/40 hover:border-primary/20",
                )}
              >
                {paymentMethod === "cod" && (
                  <div className="absolute top-0 right-0 bg-primary text-white p-1 rounded-bl-xl shadow-md">
                    <Check className="size-3.5 stroke-[4px]" />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <Banknote
                    className={cn(
                      "size-6",
                      paymentMethod === "cod"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <div className="leading-tight">
                    <p className="font-bold text-base">ক্যাশ অন ডেলিভারি</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                      পণ্য হাতে পেয়ে টাকা দিন
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Banking */}
              <div
                onClick={() => setValue("paymentMethod", "mobile")}
                className={cn(
                  "relative flex items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer w-full",
                  paymentMethod === "mobile"
                    ? "border-primary bg-primary/3"
                    : "border-border/40 bg-card/40 hover:border-primary/20",
                )}
              >
                {paymentMethod === "mobile" && (
                  <div className="absolute top-0 right-0 bg-primary text-white p-1 rounded-tr-xl rounded-bl-xl shadow-md z-10">
                    <Check className="size-3.5 stroke-[4px]" />
                  </div>
                )}

                {/* Icon */}
                <Zap
                  className={cn(
                    "size-6 shrink-0",
                    paymentMethod === "mobile"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />

                {/* Label */}
                <span className="font-bold text-base flex-1 min-w-0 truncate">
                  মোবাইল ব্যাংকিং
                </span>

                {/* Logos */}
                <div className="flex shrink-0 -space-x-2 pr-4">
                  {["bkash", "nagad", "rocket"].map((p) => (
                    <div
                      key={p}
                      className="size-8 rounded-full bg-white shadow-sm ring-2 ring-white overflow-hidden flex items-center justify-center"
                    >
                      <Image
                        src={`/payment-method-logo/${p}.${p === "rocket" ? "png" : "svg"}`}
                        alt={p}
                        width={28}
                        height={28}
                        className="p-1 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Provider Selection UI */}
          {paymentMethod === "mobile" && (
            <div className="animate-in slide-in-from-top-2 duration-300 rounded-2xl bg-primary/2 border border-primary/20 p-6 space-y-7">
              <RadioGroup className="grid grid-cols-3 gap-3">
                {(["bkash", "nagad", "rocket"] as const).map((p) => (
                  <div
                    key={p}
                    onClick={() => setValue("paymentProvider", p)}
                    className={cn(
                      "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer bg-white",
                      paymentProvider === p
                        ? "border-primary shadow-md scale-105"
                        : "border-border/40 grayscale opacity-60 hover:grayscale-0 hover:opacity-100",
                    )}
                  >
                    {paymentProvider === p && (
                      <div className="absolute top-0 right-0 bg-primary text-white p-1 rounded-tr-xl rounded-bl-xl">
                        <Check className="size-3 stroke-[4px]" />
                      </div>
                    )}
                    <div className="relative size-12 mb-2">
                      <Image
                        src={PAYMENT_ACCOUNTS[p].logo}
                        alt={p}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">
                      {p}
                    </p>
                  </div>
                ))}
              </RadioGroup>

              <div className="bg-white rounded-2xl p-6 border border-primary/10 space-y-4 shadow-sm">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Send Money (Personal)
                  </p>
                  <p className="text-sm font-medium">
                    নিচের নাম্বারে{" "}
                    <span className="font-black text-foreground">
                      {formatPrice(grandTotal)}
                    </span>{" "}
                    সেন্ড মানি করুন:
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 group overflow-hidden">
                  <p
                    className={cn(
                      "text-lg sm:text-2xl font-mono font-black tracking-wide min-w-0 truncate",
                      PAYMENT_ACCOUNTS[paymentProvider]?.color,
                    )}
                  >
                    {PAYMENT_ACCOUNTS[paymentProvider]?.number}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      handleCopy(PAYMENT_ACCOUNTS[paymentProvider].number)
                    }
                    className="shrink-0 h-9 px-4 rounded-lg text-xs font-black uppercase tracking-wider"
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">
                    আপনার নম্বর
                  </Label>
                  <Input
                    {...register("senderNumber")}
                    placeholder="01XXXXXXXXX"
                    className="h-12 rounded-xl text-base"
                  />
                  <p className="text-[10px] text-muted-foreground font-medium ml-1">
                    যে নাম্বার থেকে টাকা পাঠিয়েছেন
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">
                    Transaction ID (TrxID)
                  </Label>
                  <Input
                    {...register("transactionId")}
                    placeholder="8N7X2W..."
                    className="h-12 rounded-xl text-base"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-24 rounded-[2rem] border border-border/40 bg-card/40 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-base font-black uppercase tracking-widest border-b border-border/40 pb-4">
              অর্ডার সামারি
            </h2>

            <div className="space-y-5 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar">
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex gap-4 items-center group"
                >
                  <div className="relative size-16 rounded-xl overflow-hidden shrink-0 border border-border/40 aspect-square shadow-sm">
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg shadow-md">
                      x{item.itemQuantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                      {item.product.title}
                    </h4>
                    <p className="text-xs font-black text-primary mt-1">
                      {formatPrice(
                        item.product.salePrice || item.product.regularPrice,
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-black">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-foreground/3 p-5 rounded-2xl border border-border/20 space-y-4">
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>সাবটোটাল</span>
                <span className="text-foreground">
                  {formatPrice(cart.total)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>ডেলিভারি চার্জ</span>
                <span className="text-foreground">
                  + {formatPrice(deliveryCharge)}
                </span>
              </div>
              <Separator className="bg-border/20" />
              <div className="flex justify-between items-end pt-1">
                <span className="text-xs font-black uppercase text-primary tracking-widest">
                  সর্বমোট
                </span>
                <span className="text-3xl font-black text-primary tracking-tighter leading-none">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              disabled={isSubmitting}
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin size-6" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>অর্ডার কনফার্ম করুন</span>
                  <ArrowRight className="size-5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              )}
            </Button>

            <div className="flex justify-center gap-6 py-2 opacity-40">
              <ShieldCheck className="size-5" />
              <Truck className="size-5" />
              <PackageCheck className="size-5" />
            </div>
          </div>
        </div>
      </form>

      {/* Success Modal — closing redirects to /products since cart is empty */}
      <Dialog
        open={showSuccessModal}
        onOpenChange={(open) => {
          if (!open) router.push("/products");
        }}
      >
        <DialogContent className="max-w-[90vw] sm:max-w-105 rounded-[2.5rem] p-10 text-center space-y-6">
          <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 animate-in zoom-in duration-500 shadow-inner">
            <PackageCheck className="size-10" />
          </div>
          <div className="space-y-3">
            <DialogTitle className="text-3xl font-black tracking-tight">
              অর্ডার সফল হয়েছে!
            </DialogTitle>
            <DialogDescription className="text-sm font-medium leading-relaxed">
              অর্ডার আইডি:{" "}
              <span className="text-primary font-bold">#{orderId}</span>. <br />{" "}
              খুব শীঘ্রই আমাদের প্রতিনিধি আপনাকে কল করবেন।
            </DialogDescription>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2">
            <Link href="/products" className="block w-full">
              <Button className="w-full h-12 rounded-xl text-base font-bold bg-primary shadow-lg shadow-primary/20">
                কেনাকাটা চালিয়ে যান
              </Button>
            </Link>
            <Link href="/dashboard/orders" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl text-base font-bold border-border/60"
              >
                অর্ডার স্ট্যাটাস দেখুন
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
