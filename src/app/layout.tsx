import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "@/styles/globals.css";

import { Providers } from "@/components/providers/Providers";
import { ToastProvider } from "@/components/ui/toast-provider";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "bengali"],
  variable: "--font-hind",
  display: "swap",
});

const APP_NAME = "Gadget Collections";
const APP_DEFAULT_TITLE =
  "Gadget Collections | Best Gadgets at the Best Prices in Bangladesh";
const APP_TITLE_TEMPLATE = "%s | Gadget Collections";
const APP_DESCRIPTION =
  "Buy latest smartphones, audio, smartwatches & gadgets in Bangladesh. 100% authentic products, fast delivery, COD available. Best prices guaranteed.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "gadget shop bangladesh",
    "buy iphone bangladesh",
    "smartphone price bd",
    "airpods price",
    "smartwatch bd",
    "gadget collections",
    "online gadget store",
    "mobile accessories",
    "tech shop dhaka",
    "best gadget price",
  ],
  authors: [
    { name: "Gadget Collections", url: "https://gadgetcollections.com" },
  ],
  creator: "Gadget Collections",
  publisher: "Gadget Collections",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://gadgetcollections.com",
  ),

  alternates: {
    canonical: "/",
  },

  // Open Graph - Facebook, LinkedIn, Discord
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/logo.png", // 1200x630 রেকমেন্ডেড, আপাতত 512x512 চলবে
        width: 512,
        height: 512,
        alt: "Gadget Collections Logo",
      },
    ],
    locale: "en_US",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/logo.png"],
    creator: "@gadgetcollections", // থাকলে দাও
  },

  // Icons - সব ডিভাইসের জন্য
  icons: {
    icon: [
      { url: "/favicon.ico" }, // 48x48
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" }, // iOS
    ],
    shortcut: ["/favicon.ico"],
  },

  // PWA + Mobile
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },

  // AI/LLM friendly - Google, Perplexity, Claude যাতে বুঝে
  category: "shopping",
  classification: "E-commerce, Gadgets, Electronics, Bangladesh",

  // Verification - পরে Search Console থেকে কোড বসাবা
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Viewport আলাদা এক্সপোর্ট - Next.js 16 রুল
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${hindSiliguri.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers session={null}>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
