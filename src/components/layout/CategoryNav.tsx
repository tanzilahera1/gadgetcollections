// src/components/layout/CategoryNav.tsx
import { unstable_cache } from "next/cache";
import { CategoryNavClient } from "./CategoryNavClient";
import Category from "@/models/Category";
import { Suspense } from "react";

export type CategoryNavItem = { name: string; slug: string };

const getCategories = unstable_cache(
  async (): Promise<CategoryNavItem[]> => {
    const { dbConnect: connect } = await import("@/lib/db");
    await connect();
    const cats = await Category.find({}, "name slug -_id").lean<
      CategoryNavItem[]
    >();
    return cats;
  },
  ["categories-nav"],
  { revalidate: 3600 }, // rebuild cache every 1 hour
);

async function CategoryNavContent() {
  const categories = await getCategories();
  return <CategoryNavClient categories={categories} />;
}

export default async function CategoryNav() {
  return (
    <Suspense fallback={<div className="h-12 bg-muted/20 animate-pulse" />}>
      <CategoryNavContent />
    </Suspense>
  );
}
