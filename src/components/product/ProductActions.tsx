// src\components\product\ProductActions.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Truck,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  productId: string;
  stock: number;
}

export function ProductActions({ productId, stock }: ProductActionsProps) {
  const [qty, setQty] = useState(1);
  const { addToCart, isAdding } = useCart();
  const router = useRouter();

  const isDisabled = isAdding || stock <= 0;

  const handleAddToCart = () => {
    addToCart(
      { productId, quantity: qty },
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
        }
      }
    );
  };

  const handleBuyNow = () => {
    addToCart(
      { productId, quantity: qty },
      {
        onSuccess: (data: { success?: boolean }) => {
          if (data?.success) {
            router.push("/checkout");
          }
        }
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Quantity */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Quantity</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center border rounded-xl bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl active:scale-95"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-10 text-center font-semibold">{qty}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl active:scale-95"
              onClick={() => setQty(Math.min(stock, qty + 1))}
              disabled={qty >= stock}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <p className="text-xs">
            {stock > 0 ? (
              <span className="text-emerald-600 font-semibold">
                {stock} in stock
              </span>
            ) : (
              <span className="text-red-500 font-semibold">Out of stock</span>
            )}
          </p>
        </div>
      </div>

      {/* Actions — আগের স্টাইল */}
      <div className="grid grid-cols-2 gap-3 w-full">
        <Button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className="
            w-full h-12
            rounded-xl
            text-sm font-semibold
            gap-2
            bg-muted text-foreground
            border border-border
            hover:bg-muted/70
            active:scale-[0.97]
            transition-all
          "
        >
          <ShoppingCart className="size-4 shrink-0" />
          Add to Cart
        </Button>

        <Button
          onClick={handleBuyNow}
          disabled={isDisabled}
          className="
            w-full h-12
            rounded-xl
            text-sm font-semibold
            gap-2
            bg-black text-white
            hover:bg-black/90
            shadow-sm
            active:scale-[0.97]
            transition-all
          "
        >
          <Zap className="size-4 text-yellow-400 shrink-0" />
          Buy Now
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
