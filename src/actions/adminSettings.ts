"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Setting from "@/models/Setting";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbConnect();

    // As we only maintain one global settings document, we either update the existing one or create the first one.
    let setting = await Setting.findOne();

    if (setting) {
      await Setting.findByIdAndUpdate(setting._id, data);
    } else {
      setting = new Setting(data);
      await setting.save();
    }

    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update settings",
    };
  }
}
