"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Brand from "@/models/Brand";
import { revalidatePath } from "next/cache";

export async function createBrand(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();

    const rawName = (data.name as string) || "";
    let finalSlug =
      (data.slug as string) ||
      rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    if (!finalSlug) finalSlug = "brand-" + Date.now().toString().slice(-4);

    const newBrand = new Brand({
      ...data,
      slug: finalSlug,
    });

    await newBrand.save();

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/new");
    revalidatePath("/");

    return { success: true, brandId: newBrand._id.toString() };
  } catch (error) {
    console.error("Failed to create brand:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create brand",
    };
  }
}

export async function updateBrand(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();

    const rawName = (data.name as string) || "";
    if (!data.slug && rawName) {
      data.slug = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    await Brand.findByIdAndUpdate(id, data);

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update brand:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update brand",
    };
  }
}

export async function deleteBrand(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    await Brand.findByIdAndDelete(id);

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete brand",
    };
  }
}
