"use client";

import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import { IProduct } from "@/types/product";
import { formatPrice, calculateDiscount } from "@/lib/priceUtils";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface HeroSectionProps {
  featuredProducts: IProduct[];
}

export default function HeroSection({ featuredProducts }: HeroSectionProps) {
  const { addToCart, isAdding } = useCart();
  const isClient = useIsClient();

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

  const Card = ({ product }: { product: IProduct }) => {
    const discount = calculateDiscount(product.regularPrice, product.salePrice);
    return (
      <div
        key={product._id.toString()}
        className="group relative flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-2 md:pl-4"
      >
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border/30 shadow-sm transition-shadow">
          <Link href={getProductUrl(product)} className="absolute inset-0 z-0 block">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          {discount > 0 && (
            <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text- md:text-xs font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </div>
          )}
          <div className="absolute inset-0 p-2 flex flex-col justify-end pointer-events-none">
            <div className="flex items-end justify-between gap-1.5 pointer-events-auto">
              <div className="flex flex-col flex-1 min-w-0">
                <Link href={getProductUrl(product)}>
                  <h3 className="hidden md:block text-xs lg:text-sm font-medium text-white leading-tight truncate hover:underline">
                    {product.title}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className="text- md:text-sm font-bold text-white whitespace-nowrap">
                    {formatPrice(product.salePrice || product.regularPrice)}
                  </p>
                  {discount > 0 && (
                    <p className="text- md:text-xs text-white/60 tracking-widest line-through">
                      {formatPrice(product.regularPrice)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(
                    {
                      productId: product._id.toString(),
                      quantity: 1,
                    },
                    {
                      onSuccess: (data: { success?: boolean }) => {
                        if (data?.success) {
                          toast.success("কার্টে যোগ হয়েছে!");
                        }
                      },
                    },
                  );
                }}
                className={cn(
                  "ml-auto shrink-0 h-6 md:h-8 px-2 md:px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-95 flex items-center gap-1",
                  isAdding && "opacity-50 pointer-events-none",
                )}
              >
                <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text- md:text-xs font-bold">কিনুন</span>
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
              {featuredProducts.map((product) => (
                <Card key={product._id.toString()} product={product} />
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
