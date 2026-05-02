"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  quantity: number; 
  setQuantity: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  variant?: "default" | "compact" | "premium";
}
 
export default function QuantitySelector({
  quantity,
  setQuantity, 
  min,
  max, 
  step = 1,
  className,
  variant = "premium",
}: QuantitySelectorProps) {
  const handleDecrease = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (quantity > min) {
      const nextValue = Math.max(min, quantity - step);
      setQuantity(nextValue);
    }
  };

  const handleIncrease = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (quantity < max) {
      const nextValue = Math.min(max, quantity + step);
      setQuantity(nextValue);
    }
  };

  if (variant === "compact") {
    return (
      <div className={cn("inline-flex items-center gap-1.5", className)}>
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full border-border/40 hover:bg-primary/10"
          onClick={handleDecrease}
          disabled={quantity <= min}
        >
          <Minus className="size-3" />
        </Button>
        <span className="text-sm font-bold min-w-[3ch] text-center">
          {quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-full border-border/40 hover:bg-primary/10"
          onClick={handleIncrease}
          disabled={quantity >= max}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    );
  }
 
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/40 bg-secondary/40 backdrop-blur-[10px] p-1 shadow-sm transition-all hover:border-border/60",
        variant === "premium" &&
          "bg-linear-to-b from-card/80 to-card/40 ring-1 ring-white/10 shadow-inner",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 p-0 hover:bg-primary hover:text-primary-foreground active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:scale-100 transition-all rounded-full"
        onClick={handleDecrease}
        disabled={quantity <= min}
        aria-label="কমান"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      <div className="flex flex-col items-center justify-center min-w-[4ch]">
        <span className="text-sm font-black tabular-nums select-none px-1 tracking-tight">
          {quantity}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 p-0 hover:bg-primary hover:text-primary-foreground active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:scale-100 transition-all rounded-full"
        onClick={handleIncrease}
        disabled={quantity >= max}
        aria-label="বাড়ান"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
