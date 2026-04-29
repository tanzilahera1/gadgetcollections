"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function createProduct(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    // Convert flat list of URLs into proper image schema array
    let images: { url: string; alt: string; order: number }[] = [];
    if (data.images && Array.isArray(data.images)) {
      images = data.images.filter((url: string) => url.trim() !== "").map((url: string, index: number) => ({
        url,
        alt: `${data.title as string} - Image ${index + 1}`,
        order: index
      }));
    }

    const newProduct = new Product({
      ...data,
      images,
      slug: (data.title as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4),
    });

    await newProduct.save();
    
    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return { success: true, productId: newProduct._id.toString() };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();
    
    // Convert flat list of URLs into proper image schema array
    let images: { url: string; alt: string; order: number }[] = [];
    if (data.images && Array.isArray(data.images)) {
      images = data.images.filter((url: string) => url.trim() !== "").map((url: string, index: number) => ({
        url,
        alt: `${data.title as string} - Image ${index + 1}`,
        order: index
      }));
    }

    const updatedData = {
      ...data,
      images,
    };

    await Product.findByIdAndUpdate(id, updatedData);
    
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update product" };
  }
}
