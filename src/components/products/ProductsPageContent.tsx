// src/components/products/ProductsPageContent.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { SearchX, PackageX, Loader2 } from "lucide-react";
import type { IProduct } from "@/types/product";
import type { ICategory } from "@/types/category";

interface ProductsPageContentProps {
  initialProducts: IProduct[];
  initialCategories: ICategory[];
}

export function ProductsPageContent({
  initialProducts,
  initialCategories,
}: ProductsPageContentProps) {
  const searchParams = useSearchParams();

  const hasFilters = Array.from(searchParams.entries()).length > 0;
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");

  const { data, isLoading } = useQuery({
    queryKey: ["products", { category, search, minPrice, maxPrice, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sort) params.append("sort", sort);

      const res = await fetch(`/api/products?${params}`);
      return res.json();
    },
    enabled: hasFilters,
    initialData: hasFilters ? undefined : initialProducts,
  });

  const products: IProduct[] = data || initialProducts;
  const currentCategory =
    category && initialCategories.find((c) => c.slug === category);

  if (isLoading && hasFilters) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Category Title */}
      {currentCategory && (
        <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {currentCategory.name}
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest">
            {products.length} products found
          </p>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-1000">
          {products.map((product) => (
            <ProductCard key={String(product._id)} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="size-28 bg-card/60 backdrop-blur-xl border border-border/40 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/5 relative">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" />
            {search ? (
              <SearchX className="size-12 text-muted-foreground" />
            ) : (
              <PackageX className="size-12 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {search ? "কোনো প্রোডাক্ট পাওয়া যায়নি" : "স্টক খালি"}
            </h3>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              {search
                ? `আমরা "${search}" এর জন্য কোনো প্রোডাক্ট খুঁজে পাইনি।`
                : "এই ক্যাটাগরিতে এই মুহূর্তে কোনো প্রোডাক্ট নেই।"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
