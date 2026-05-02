// src\components\product\ProductActions.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import QuantitySelector from "@/components/products/QuantitySelector";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Truck, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ICartItem, IPopulatedCartItem } from "@/types/cart";

interface ProductActionsProps {
  productId: string;
  stock: number;
}

export function ProductActions({ productId, stock }: ProductActionsProps) {
  const {
    addToCart,
    isAdding,
    cart,
    updateQty,
    isUpdating,
    removeItem,
    isRemoving,
  } = useCart();
  const router = useRouter();

  // কার্টে আছে কিনা চেক করো
  const cartItem = cart?.items?.find((item: ICartItem | IPopulatedCartItem) => {
    const itemProductId =
      typeof item.product === "object" &&
      item.product !== null &&
      "_id" in item.product
        ? String(item.product._id)
        : String(item.product);
    return itemProductId === productId;
  });

  const isInCart = !!cartItem;
  const currentQtyInCart = cartItem?.itemQuantity || 0;

  // লোকাল স্টেট শুধুমাত্র তখন ব্যবহার হবে যখন প্রোডাক্ট কার্টে নেই
  const [localQty, setLocalQty] = useState(1);
  const displayQty = isInCart ? currentQtyInCart : localQty;

  const isActionPending = isAdding || isUpdating || isRemoving;
  const isDisabled = isActionPending || stock <= 0;

  const handleQtyChange = (newQty: number) => {
    if (isInCart) {
      if (newQty > currentQtyInCart) {
        updateQty({ productId, quantity: newQty });
      } else if (newQty < currentQtyInCart) {
        if (newQty === 0) {
          removeItem({ productId });
        } else {
          updateQty({ productId, quantity: newQty });
        }
      }
    } else {
      setLocalQty(newQty);
    }
  };

  const handleAddToCart = () => {
    if (isInCart) {
      toast.info("ইতিমধ্যে এই প্রোডাক্ট কার্টে যোগ করা হয়েছে।", {
        icon: <ShoppingCart className="size-4" />,
      });
      return;
    }

    addToCart(
      { productId, quantity: localQty },
      {
        onSuccess: (data: { success?: boolean }) => {
          if (data?.success) {
            toast.success("Added to cart 🛒", {
              description: "Item added successfully.",
              action: {
                label: "Checkout",
                onClick: () => router.push("/checkout"),
              },
            });
          }
        },
      },
    );
  };

  const handleBuyNow = () => {
    if (isInCart) {
      router.push("/checkout");
      return;
    }

    addToCart(
      { productId, quantity: localQty },
      {
        onSuccess: (data: { success?: boolean }) => {
          if (data?.success) {
            router.push("/checkout");
          }
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      {/* Quantity - Centralized */}
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          Quantity{" "}
          {isInCart && (
            <span className="text-primary ml-2 lowercase font-medium">
              (in cart)
            </span>
          )}
        </p>
        <div className="flex items-center justify-between gap-4">
          <QuantitySelector
            quantity={displayQty}
            setQuantity={handleQtyChange}
            min={isInCart ? 0 : 1}
            max={stock}
            className="h-12"
          />
          <p className="text-xs">
            {stock > 0 ? (
              <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">
                {stock} in stock
              </span>
            ) : (
              <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-full">
                Out of stock
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={cn(
            "w-full h-12 rounded-xl text-sm font-black uppercase tracking-tight gap-2 border border-border transition-all active:scale-[0.97]",
            isInCart
              ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-400"
              : "bg-muted text-foreground hover:bg-muted/70",
          )}
        >
          <ShoppingCart className="size-4 shrink-0" />
          {isInCart ? "Added" : "Add to Cart"}
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={isDisabled}
          className="
            w-full h-12
            rounded-xl
            text-sm font-black uppercase tracking-tight
            gap-2
            bg-slate-950 text-white
            hover:bg-slate-800
            shadow-xl shadow-slate-950/20
            active:scale-[0.97]
            transition-all
            dark:bg-white dark:text-black dark:hover:bg-slate-200
          "
        >
          <Zap className="size-4 text-yellow-400 fill-yellow-400 shrink-0" />
          {isInCart ? "Checkout" : "Buy Now"}
        </Button>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-foreground/10"></div>
        <span className="shrink-0 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          Service Info
        </span>
        <div className="h-px flex-1 bg-foreground/10"></div>
      </div>

      {/* Trust Badges — ভার্টিক্যাল */}
      <div className="flex flex-col rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
          <Truck className="size-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Delivery</p>
            <p className="text-xs font-bold">24–48h</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
          <RefreshCcw className="size-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Return</p>
            <p className="text-xs font-bold">7 Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
