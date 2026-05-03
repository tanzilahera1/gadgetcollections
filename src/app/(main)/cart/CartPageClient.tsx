// src/app/(main)/cart/CartPageClient.tsx
"use client";

import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  PackageX,
  Truck,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { formatPrice } from "@/lib/priceUtils";
import QuantitySelector from "@/components/products/QuantitySelector";
import { IPopulatedCartItem } from "@/types/cart";

export default function CartPageClient() {
  const { cart, updateQty, removeItem, isLoadingCart } = useCart();

  const getCategorySlug = (product: IPopulatedCartItem["product"]): string => {
    return product.category?.slug || "uncategorized";
  };

  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="size-24 bg-muted rounded-full mb-6"></div>
          <div className="h-8 w-48 bg-muted rounded mb-3"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="size-24 mx-auto rounded-full bg-muted/50 backdrop-blur-[10px] flex items-center justify-center mb-6">
            <PackageX className="size-12 text-muted-foreground" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            আপনার কার্ট খালি
          </h1>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            এখনো কোনো প্রিমিয়াম গ্যাজেট যোগ করা হয়নি। এখনই আপনার পছন্দের
            কালেকশন দেখুন!
          </p>

          <Button asChild size="lg" className="rounded-full shadow-lg px-8">
            <Link href="/products">
              <ShoppingBag className="mr-2 size-5" />
              কেনাকাটা শুরু করুন
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-32 lg:pb-12">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items */}
        <section className="lg:col-span-2 space-y-6" aria-label="কার্ট আইটেম">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-baseline gap-3">
              আপনার কার্ট
              <span className="text-lg font-medium text-muted-foreground">
                ({cart.items.length}টি পণ্য)
              </span>
            </h1>
          </div>

          <div className="space-y-4">
            {cart.items.map((item: IPopulatedCartItem) => {
              const product = item.product;
              const itemTotal = item.subtotal;
              const productHref = `/products/${getCategorySlug(product)}/${product.slug}`;

              return (
                <article
                  key={product._id}
                  className="group relative flex gap-3 sm:gap-4 p-3 sm:p-5 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-[20px] hover:shadow-xl hover:border-border/60 transition-all duration-300 overflow-hidden"
                >
                  <Link
                    href={productHref}
                    className="relative size-24 sm:size-32 shrink-0 overflow-hidden rounded-xl bg-muted/20 aspect-square group-hover:shadow-lg transition-shadow duration-300"
                  >
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      sizes="(max-width: 640px) 96px, 128px"
                    />

                    {/* ইমেজকে কার্ডের মতো প্রিমিয়াম দেখানোর জন্য একটি হালকা ওভারলে (ঐচ্ছিক) */}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-none text-[10px] font-bold"
                        >
                          PREMIUM
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600 border-none text-[10px]"
                        >
                          ইন স্টক
                        </Badge>
                      </div>

                      <Link href={productHref}>
                        <h3 className="font-bold text-[13px] sm:text-lg leading-snug hover:text-primary transition-colors line-clamp-2 mb-1.5 sm:mb-2">
                          {product.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mt-3 sm:mt-6">
                      <div className="flex flex-row sm:flex-col items-baseline sm:items-start justify-between sm:justify-start gap-1">
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                          <span className="text-lg sm:text-2xl font-black text-primary">
                            {formatPrice(
                              product.salePrice || product.regularPrice,
                            )}
                          </span>
                        </div>
                        {product.salePrice && (
                          <span className="text-[9px] sm:text-xs text-muted-foreground line-through tracking-widest">
                            {formatPrice(product.regularPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-2 mt-auto">
                        <QuantitySelector
                          quantity={item.itemQuantity}
                          min={1}
                          max={product.stockQuantity || 10}
                          setQuantity={(val) =>
                            updateQty({ productId: product._id, quantity: val })
                          }
                          variant="premium"
                          className="scale-[0.75] xs:scale-[0.85] sm:scale-100 origin-left"
                        />

                        <div className="sm:hidden flex flex-col items-end pl-2 border-l border-border/20 ml-auto shrink-0">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">
                            সাবটোটাল
                          </span>
                          <span className="text-sm font-black text-primary leading-none whitespace-nowrap">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end justify-between pl-4 min-w-30 border-l border-border/20 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => removeItem({ productId: product._id })}
                    >
                      <Trash2 className="size-5" />
                    </Button>

                    <div className="text-right pb-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        সাবটোটাল
                      </p>
                      <p className="text-2xl font-black text-primary tracking-tight">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden absolute top-2 right-2 size-9 rounded-full text-muted-foreground/40 hover:text-destructive bg-card/20 backdrop-blur-sm"
                    onClick={() => removeItem({ productId: product._id })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </article>
              );
            })}
          </div>
        </section>
        {/* Right: Order Summary */}
        <aside className="lg:col-span-1 space-y-4" aria-label="অর্ডার সারাংশ">
          <div className="lg:sticky lg:top-20 flex flex-col gap-4">
            <div className="rounded-3xl border border-border/40 bg-card/40 backdrop-blur-[20px] p-6 sm:p-8 shadow-xl relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <h2 className="text-2xl font-black mb-6 border-b border-border/40 pb-4">
                অর্ডার সারাংশ
              </h2>

              <div className="space-y-4 mb-8">
                {/* Item Breakdown List */}
                <div className="space-y-3 mb-6 max-h-55 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.items.map((item: IPopulatedCartItem) => (
                    <div
                      key={item.product._id}
                      className="flex justify-between items-start gap-3 text-sm px-1"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-semibold line-clamp-1 leading-tight">
                          {item.product.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                          {formatPrice(
                            item.product.salePrice || item.product.regularPrice,
                          )}{" "}
                          <span className="text-primary mx-0.5 lowercase">
                            x
                          </span>{" "}
                          {item.itemQuantity}
                        </p>
                      </div>
                      <span className="font-bold shrink-0 text-right">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ✅ Dashed Line before Subtotal */}
                <div className="border-t border-dashed border-gray-300 pt-4 ">
                  <div className="flex justify-between items-center text-sm sm:text-base px-1">
                    <span className="text-muted-foreground font-medium">
                      সাবটোটাল
                    </span>
                    <span className="font-bold">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* ✅ Solid Line (Separator) before Grand Total */}
                <div className="pt-4 mt-4 border-t border-gray-300 flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      সর্বমোট
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      (ডেলিভারি চার্জ ছাড়া)
                    </span>
                  </div>
                  <span className="text-3xl font-black text-primary tracking-tight">
                    {formatPrice(cart.total)}
                  </span>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full h-14 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
              >
                <Link href="/checkout">
                  চেকআউট করুন
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                  <Truck className="size-4 text-primary shrink-0" />
                  <p>পরবর্তী পেজে ডেলিভারি এরিয়া সিলেক্ট করুন।</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md p-5 flex flex-col gap-4 shadow-sm">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                GadgetCollections নিশ্চিত করছে
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold">অরিজিনাল পণ্য</p>
                    <p className="text-[9px] text-muted-foreground">
                      গ্যারান্টিড
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Cpu className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold">টেক সাপোর্ট</p>
                    <p className="text-[9px] text-muted-foreground">
                      ২৪/৭ হেল্পডেস্ক
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/90 backdrop-blur-2xl border-t border-primary/20 p-4 shadow-2xl safe-area-bottom">
        <div className="container mx-auto flex items-center justify-between gap-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              সর্বমোট
            </span>
            <span className="text-2xl font-black text-primary tracking-tight">
              {formatPrice(cart.total)}
            </span>
          </div>

          <Button
            asChild
            size="lg"
            className="h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/20 group flex-1"
          >
            <Link href="/checkout">
              চেকআউট
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
