"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please login to manage wishlist", notLoggedIn: true };
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return { error: "User not found" };

    const objectId = new Types.ObjectId(productId);
    
    // Check if item exists in wishlist
    const index = user.wishlist.findIndex((id: Types.ObjectId) => id.toString() === productId);
    
    let isAdded = false;
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(objectId);
      isAdded = true;
    }

    await user.save();
    
    // Revalidate relevant paths
    revalidatePath("/dashboard/wishlist");
    revalidatePath("/dashboard");
    
    return { success: true, isAdded };
  } catch {
    return { error: "Failed to update wishlist" };
  }
}
