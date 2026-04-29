"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";

export async function createCategory(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    // Auto-generate slug from name if not adequately provided
    const rawName = data.name as string || "";
    let finalSlug = (data.slug as string) || rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    if (!finalSlug) finalSlug = 'category-' + Date.now().toString().slice(-4);
    
    const newCategory = new Category({
      ...data,
      slug: finalSlug
    });

    await newCategory.save();
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/new");
    revalidatePath("/");
    
    return { success: true, categoryId: newCategory._id.toString() };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    const rawName = data.name as string || "";
    if (!data.slug && rawName) {
      data.slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    await Category.findByIdAndUpdate(id, data);
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await Category.findByIdAndDelete(id);
    
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete category" };
  }
}
