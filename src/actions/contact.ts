"use server";

import { sendDiscordContactMessage } from "@/lib/discord";

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !phone || !subject || !message) {
      return { success: false, error: "Please fill out all required fields." };
    }

    // Send it asynchronously via webhook integration
    await sendDiscordContactMessage({
      name,
      phone,
      email,
      subject,
      message,
    });

    return { success: true };
  } catch (error) {
    console.error("Contact Form Submission Error:", error);
    return { success: false, error: "Something went wrong. Please try again later." };
  }
}
