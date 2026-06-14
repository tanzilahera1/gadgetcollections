// src/lib/meta-capi.ts
import { createHash } from "crypto";
import { headers, cookies } from "next/headers";

interface MetaUserData {
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
}

interface MetaCustomData {
  value?: number;
  currency?: "BDT" | "USD";
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  content_type?: "product" | "product_group";
  num_items?: number;
  order_id?: string;
}

interface MetaEventData {
  eventName:
    | "PageView"
    | "ViewContent"
    | "AddToCart"
    | "InitiateCheckout"
    | "Purchase"
    | "Search"
    | "Contact";
  eventID: string;
  sourceUrl?: string;
  userData: MetaUserData;
  customData?: MetaCustomData;
}

function hashData(data: string): string {
  return createHash("sha256").update(data.trim().toLowerCase()).digest("hex");
}

type UserDataPayload = {
  client_ip_address?: string;
  client_user_agent?: string;
  em?: string[];
  ph?: string[];
  fbp?: string;
  fbc?: string;
  ct?: string[];
  st?: string[];
  zp?: string[];
  country?: string[];
};

export async function sendMetaEvent(eventData: MetaEventData): Promise<void> {
  if (
    process.env.NODE_ENV !== "production" &&
    !process.env.META_TEST_EVENT_CODE
  ) {
    console.log("Meta CAPI: Skipped in dev without META_TEST_EVENT_CODE");
    return;
  }

  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("Meta CAPI: PIXEL_ID or ACCESS_TOKEN missing");
    return;
  }

  try {
    // Next.js 15+ এ headers() await করতে হয়
    const headersList = await headers();
    const ip =
      eventData.userData.client_ip_address ||
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      "";
    const ua =
      eventData.userData.client_user_agent ||
      headersList.get("user-agent") ||
      "";

    const userData: UserDataPayload = {
      client_ip_address: ip,
      client_user_agent: ua,
    };

    if (eventData.userData.email)
      userData.em = [hashData(eventData.userData.email)];
    if (eventData.userData.phone)
      userData.ph = [
        hashData(eventData.userData.phone.replace(/[^0-9+]/g, "")),
      ];
    if (eventData.userData.fbp) userData.fbp = eventData.userData.fbp;
    if (eventData.userData.fbc) userData.fbc = eventData.userData.fbc;
    if (eventData.userData.ct) userData.ct = [hashData(eventData.userData.ct)];
    if (eventData.userData.st) userData.st = [hashData(eventData.userData.st)];
    if (eventData.userData.zp) userData.zp = [hashData(eventData.userData.zp)];
    userData.country = [hashData(eventData.userData.country || "bd")];

    const payload = {
      data: [
        {
          event_name: eventData.eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url:
            eventData.sourceUrl || process.env.NEXT_PUBLIC_APP_URL,
          event_id: eventData.eventID,
          user_data: userData,
          custom_data: eventData.customData,
        },
      ],
      ...(process.env.META_TEST_EVENT_CODE && {
        test_event_code: process.env.META_TEST_EVENT_CODE,
      }),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const errorResponse: unknown = await res.json();
      console.error("Meta CAPI Error:", errorResponse);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Meta CAPI: Request timeout after 3s");
    } else {
      console.error("Meta CAPI Request Failed:", error);
    }
  }
}

// cookies() ও async, তাই await লাগবে
export async function getFbCookies() {
  const cookieStore = await cookies();
  return {
    fbp: cookieStore.get("_fbp")?.value,
    fbc: cookieStore.get("_fbc")?.value,
  };
}
