// src/app/(main)/products/page.tsx
import { Suspense } from "react";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { ProductsPageContent } from "@/components/products/ProductsPageContent";
import Footer from "@/components/layout/Footer";

import type { IProduct } from "@/types/product";
import type { ICategory } from "@/types/category";

export const revalidate = 3600; // পেজটি এখন ISR (প্রতি ১ ঘণ্টায় স্ট্যাটিক জেনারেট হবে)

// 🛡️ Populated Document Types (any এড়ানোর জন্য)
type PopulatedProductDoc = Omit<IProduct, "category"> & {
  category: ICategory;
  _id: unknown;
};

type CategoryDoc = ICategory & { _id: unknown };

async function getInitialData() {
  await dbConnect();

  const productsDocs = await Product.find({ status: "published" })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const categoriesDocs = await Category.find().lean();

  // Serialization mapping safely without 'any'
  const products = (productsDocs as unknown as PopulatedProductDoc[]).map(
    (p) => ({
      ...p,
      _id: String(p._id),
      category: {
        ...p.category,
        _id: String(p.category._id),
      },
    }),
  ) as unknown as IProduct[];

  const categories = (categoriesDocs as unknown as CategoryDoc[]).map((c) => ({
    ...c,
    _id: String(c._id),
  })) as unknown as ICategory[];

  return { products, categories };
}

export default async function ProductsPage() {
  const { products, categories } = await getInitialData();

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-4">
        {/* Suspense এর কারণে ক্লায়েন্ট সাইডে searchParams লোড হতে সমস্যা হবে না */}
        <Suspense
          fallback={
            <div className="py-24 text-center animate-pulse font-semibold">
              Loading products...
            </div>
          }
        >
          <ProductsPageContent
            initialProducts={products}
            initialCategories={categories}
          />
        </Suspense>
      </section>
      <Footer />
    </>
  );
}
