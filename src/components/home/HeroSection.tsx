"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState, useMemo, useSyncExternalStore } from "react";
import { IProduct } from "@/types/product";
import { ICartItem, IPopulatedCartItem } from "@/types/cart";
import { formatPrice, calculateDiscount } from "@/lib/priceUtils";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  featuredProducts: IProduct[];
}

const emptySubscribe = () => () => {};

export default function HeroSection({ featuredProducts }: HeroSectionProps) {
  const { addToCart, cart } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const plugins = useMemo(() => {
    if (!isClient) return [];
    return [Autoplay({ delay: 3000, stopOnInteraction: false })];
  }, [isClient]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: featuredProducts.length > 4,
      align: "start",
      slidesToScroll: 1,
    },
    plugins,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    queueMicrotask(() => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const getProductUrl = (product: IProduct) => {
    const categorySlug =
      typeof product.category === "object" && "slug" in product.category
        ? product.category.slug
        : "uncategorized";
    return `/products/${categorySlug}/${product.slug}`;
  };

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  if (!featuredProducts?.length) return null;

  const Card = ({ product, index }: { product: IProduct; index: number }) => {
    const discount = calculateDiscount(product.regularPrice, product.salePrice);
    const isFirst = index === 0;
    const isInCart = cart?.items?.some(
      (item: ICartItem | IPopulatedCartItem) =>
        (typeof item.product === "object"
          ? String(item.product._id)
          : String(item.product)) === product._id.toString(),
    );

    return (
      <div
        key={product._id.toString()}
        className="group relative flex-[0_0_55%] sm:flex-[0_0_45%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-2 md:pl-4"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/30 shadow-sm transition-shadow">
          <Link
            href={getProductUrl(product)}
            className="absolute inset-0 z-10 block cursor-pointer"
          >
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 55vw, (max-width: 768px) 45vw, (max-width: 1024px) 33vw, 25vw"
              priority={isFirst}
              loading={isFirst ? "eager" : "lazy"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
          </Link>
          {/* ডিসকাউন্ট ব্যাজ */}
          {discount > 0 && (
            <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded z-20 shadow-md">
              -{discount}%
            </div>
          )}

          {/* কন্টেন্ট (টাইটেল, প্রাইস এবং বাটন) - এটা লিঙ্কের উপরে থাকবে */}
          <div className="absolute inset-0 p-2 flex flex-col justify-end pointer-events-none z-20">
            <div className="flex items-end justify-between gap-1.5 pointer-events-auto">
              <div className="flex flex-col flex-1 min-w-0">
                <Link href={getProductUrl(product)} className="cursor-pointer">
                  <h3 className="hidden md:block text-xs lg:text-sm font-bold text-white leading-tight truncate hover:underline drop-shadow-md">
                    {product.title}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className="text-[10px] md:text-sm font-bold text-white whitespace-nowrap drop-shadow-md">
                    {formatPrice(product.salePrice || product.regularPrice)}
                  </p>
                  {discount > 0 && (
                    <p className="text-[8px] md:text-xs text-white/60 tracking-widest line-through drop-shadow-sm">
                      {formatPrice(product.regularPrice)}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (isInCart) {
                    toast.info("ইতিমধ্যে এই প্রোডাক্ট কার্টে যোগ করা হয়েছে।", {
                      icon: <ShoppingCart className="size-4" />,
                      duration: 1000,
                    });
                    return;
                  }

                  setAddingId(product._id.toString());
                  addToCart(
                    {
                      productId: product._id.toString(),
                      quantity: 1,
                    },
                    {
                      onSuccess: (data: { success?: boolean }) => {
                        if (data?.success) {
                          toast.success("কার্টে যোগ হয়েছে!", { duration: 1000 });
                        }
                      },
                      onSettled: () => setAddingId(null),
                    },
                  );
                }}
                className={cn(
                  "ml-auto shrink-0 h-6 md:h-8 px-2 md:px-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-1",
                  isInCart
                    ? "bg-slate-500/50 text-white/70 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground",
                  addingId === product._id.toString() &&
                    "opacity-50 pointer-events-none",
                )}
              >
                {addingId === product._id.toString() ? (
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                )}
                <span className="text-[9px] md:text-xs font-bold">
                  {isInCart ? "যোগ হয়েছে" : "কিনুন"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-3 md:py-4">
      <div className="container mx-auto px-3 md:px-4">
        <div className="relative group">
          <button
            onClick={scrollPrev}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </button>
          <button
            onClick={scrollNext}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 md:h-10 md:w-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 items-center justify-center"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </button>
          <div className="overflow-hidden rounded-xl" ref={emblaRef}>
            <div className="flex -ml-2 md:-ml-4">
              {featuredProducts.map((product, index) => (
                <Card
                  key={product._id.toString()}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
        {featuredProducts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2.5">
            {featuredProducts.map((p, index) => (
              <button
                key={p._id.toString()}
                onClick={() => scrollTo(index)}
                className={`h-1 md:h-1.5 rounded-full transition-all ${
                  index === selectedIndex
                    ? "w-5 md:w-6 bg-primary"
                    : "w-1 md:w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
