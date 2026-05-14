// src/components/products/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Loader2, Heart, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice, calculateDiscount } from "@/lib/priceUtils";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import QuantitySelector from "@/components/products/QuantitySelector";

// Type Imports
import type { IProduct } from "@/types/product";
import type { ICartItem, IPopulatedCartItem } from "@/types/cart";
import { ICategory } from "@/types/category";
import { useState } from "react";

export default function ProductCard({ product }: { product: IProduct }) {
  const {
    cart,
    addToCart,
    updateQty,
    removeItem,
    isAdding,
    isUpdating,
    isRemoving,
  } = useCart();

  const { wishlistIds, toggleWishlist } = useWishlist();

  // Price calculations
  const discountPercentage = calculateDiscount(
    product.regularPrice,
    product.salePrice,
  );
  const displayPrice = product?.salePrice || product?.regularPrice;

  // Type Guards for slug routing
  const getCategorySlug = (): string => {
    const cat = product.category;

    // চেক করছি cat একটি অবজেক্ট কিনা এবং তার মধ্যে 'slug' প্রপার্টি আছে কিনা
    if (typeof cat === "object" && cat !== null && "slug" in cat) {
      // এখানে আমরা Next.js/TypeScript কে বলছি, "হ্যাঁ, আমি শিওর এটা ICategory"
      return (cat as ICategory).slug;
    }

    return "uncategorized";
  };

  const productHref = `/products/${getCategorySlug()}/${product.slug}`;

  // Cart Matcher Logic
  const cartItem = cart?.items?.find((item: ICartItem | IPopulatedCartItem) => {
    const itemProductId =
      typeof item.product === "object" &&
      item.product !== null &&
      "_id" in item.product
        ? String(item.product._id)
        : String(item.product);
    return itemProductId === String(product._id);
  });

  const isInCart = !!cartItem;
  const currentQty = cartItem?.itemQuantity || 0;
  const isActionPending = isAdding || isUpdating || isRemoving;
  const [showSuccess, setShowSuccess] = useState(false);

  // Handlers
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stockQuantity === 0) return toast.error("স্টক নেই!");

    // ইনস্ট্যান্ট ফিডব্যাক দেওয়ার জন্য
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    addToCart(
      { productId: String(product._id), quantity: 1 },
      {
        onSuccess: (data: { success?: boolean }) => {
          if (data?.success) {
            toast.success(`${product.title} কার্টে যোগ করা হয়েছে!`, {
              icon: <ShoppingCart className="size-4" />,
              duration: 1000,
            });
          }
        },
      },
    );
  };

  const handleIncrease = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentQty < product.stockQuantity) {
      updateQty({
        productId: String(product._id),
        quantity: currentQty + 1,
      });
    } else {
      toast.error(`সর্বোচ্চ স্টক লিমিট ${product.stockQuantity} টি`);
    }
  };

  const handleDecrease = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (currentQty > 1) {
      updateQty({
        productId: String(product._id),
        quantity: currentQty - 1,
      });
    } else {
      removeItem(
        { productId: String(product._id) },
        {
          onSuccess: () => toast.info("কার্ট থেকে রিমুভ করা হয়েছে"),
        },
      );
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl  bg-card glass-border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* 1. Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
        <Link href={productHref} className="absolute inset-0 z-0 block">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute left-3 top-3 z-10 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-xl border border-amber-500/20 text-amber-700 text-[10px] font-black uppercase tracking-wider shadow-lg dark:text-amber-400">
            {discountPercentage}% OFF
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist({ productId: String(product._id) });
          }}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/40 backdrop-blur-xl border border-slate-200/60 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-90 hover:bg-white/60",
            wishlistIds.includes(String(product._id))
              ? "text-rose-500 scale-105 shadow-rose-500/20 border-rose-500/30 bg-white/60"
              : "text-slate-700",
          )}
        >
          <Heart
            className={cn(
              "size-4 transition-all duration-300",
              wishlistIds.includes(String(product._id)) && "fill-rose-500",
            )}
          />
        </button>

        {/* Out of Stock Overlay */}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Badge
              variant="destructive"
              className="px-4 py-1.5 text-sm font-medium tracking-wide shadow-xl"
            >
              স্টক শেষ
            </Badge>
          </div>
        )}
      </div>

      {/* 2. Content Container */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-4 flex flex-1 flex-col">
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <Link href={productHref} className="flex-1">
              <h3 className="line-clamp-2 text-base sm:text-[17px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                {product.title}
              </h3>
            </Link>

            {/* Rating right beside title */}
            <div className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span>{product.ratings?.average || "0.0"}</span>
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {product.shortDesc}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="mt-auto flex items-end justify-between gap-2">
          {/* Price Stack */}
          <div className="flex flex-col gap-0.5">
            {/* Sale Price FIRST */}
            <span className="text-2xl font-black leading-none text-foreground">
              {formatPrice(displayPrice)}
            </span>

            {/* Regular Price AFTER */}
            {discountPercentage > 0 && (
              <span className="text-muted-foreground line-through text-sm tracking-widest">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {/* Dynamic Action Area */}
          <div className="relative z-10 flex min-w-27.5 shrink-0 justify-end">
            {!isInCart ? (
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0 || isActionPending}
                className={cn(
                  "flex h-9.5 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold transition-all active:scale-95 disabled:opacity-50",
                  showSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-foreground text-white dark:text-black",
                )}
              >
                {showSuccess ? (
                  <Check className="size-4 shrink-0" />
                ) : isActionPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4 shrink-0" />
                )}
                <span>{showSuccess ? "যোগ হয়েছে" : "কার্টে যোগ করুন"}</span>
              </button>
            ) : (
              /* State 2: Quantity Selector - Centralized */
              <QuantitySelector
                quantity={currentQty}
                setQuantity={(val) => {
                  if (val > currentQty) handleIncrease();
                  else handleDecrease();
                }}
                min={1}
                max={product.stockQuantity}
                variant="compact"
                className="w-28"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
