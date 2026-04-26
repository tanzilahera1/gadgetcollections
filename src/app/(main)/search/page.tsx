// src/app/(main)/search/page.tsx
import { Suspense } from "react";
import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";
import { ProductsPageContent } from "@/components/products/ProductsPageContent";

import type { ICategory } from "@/types/category";

export const dynamic = "force-dynamic"; // Search পেজ সবসময় ডাইনামিক হবে

// শুধু ক্যাটাগরিগুলো সার্ভার থেকে আনলেই হবে,
// কারণ সার্চের প্রোডাক্টগুলো ক্লায়েন্ট সাইড থেকে (ProductsPageContent এর মাধ্যমে API দিয়ে) ফেচ হবে।
async function getCategories() {
  await dbConnect();
  const categoriesDocs = await Category.find().lean();

  return categoriesDocs.map((c) => ({
    ...c,
    _id: String(c._id),
  })) as unknown as ICategory[];
}

export default async function SearchPage() {
  const categories = await getCategories();

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Search Results
        </h1>
        <p className="text-sm font-bold text-muted-foreground mt-1 tracking-widest">
          Find your favorite gadgets
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-24 text-center animate-pulse font-semibold text-lg text-muted-foreground">
            Searching products...
          </div>
        }
      >
        <ProductsPageContent
          initialProducts={[]} // প্রোডাক্ট ক্লায়েন্ট সাইড API থেকে আসবে
          initialCategories={categories}
        />
      </Suspense>
    </section>
  );
}
