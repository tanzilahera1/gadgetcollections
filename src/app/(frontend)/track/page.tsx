export const metadata = {
  title: "অর্ডার ট্র্যাক করুন | GadgetCollections",
  description:
    "আপনার অর্ডারের বর্তমান অবস্থান ও ডেলিভারি স্ট্যাটাস ট্র্যাক করুন।",
};

import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function TrackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
      <div className="p-5 bg-primary/10 rounded-3xl">
        <PackageSearch className="size-12 text-primary" />
      </div>
      <h1 className="text-3xl font-black tracking-tight">
        অর্ডার ট্র্যাক করুন
      </h1>
      <p className="text-muted-foreground max-w-md leading-relaxed">
        আপনার অর্ডার ট্র্যাক করতে আপনার <strong>Dashboard</strong> এ যান। সেখানে
        আপনার সকল অর্ডারের রিয়েল-টাইম স্ট্যাটাস দেখতে পাবেন।
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/my-orders"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          আমার অর্ডার দেখুন
        </Link>
        <Link
          href="/track-order"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-border/60 text-foreground font-bold text-sm hover:bg-accent/50 transition-all"
        >
          Order ID দিয়ে ট্র্যাক করুন
        </Link>
      </div>
    </div>
  );
}
