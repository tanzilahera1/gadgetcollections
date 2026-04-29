"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/actions/adminSettings";
import { toast } from "sonner";
import { Loader2, Save, Store, Truck, Share2, ShieldAlert } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SettingsForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      storeName: formData.get("storeName") as string,
      storeEmail: formData.get("storeEmail") as string,
      storePhone: formData.get("storePhone") as string,
      currency: formData.get("currency") as string,
      deliveryChargeInside: Number(formData.get("deliveryChargeInside")) || 60,
      deliveryChargeOutside:
        Number(formData.get("deliveryChargeOutside")) || 120,
      freeShippingThreshold: Number(formData.get("freeShippingThreshold")) || 0,
      facebookURL: formData.get("facebookURL") as string,
      instagramURL: formData.get("instagramURL") as string,
      maintenanceMode: formData.get("maintenanceMode") === "on",
    };

    try {
      const res = await updateSettings(data);

      if (res.success) {
        toast.success("Settings updated successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update settings");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* 1. Global Store Info */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Store className="size-5 text-slate-400" />
          <h2 className="text-xl font-black text-slate-900">
            General Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Store Name *
            </label>
            <input
              required
              name="storeName"
              defaultValue={initialData?.storeName || "Gadget Collections"}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Currency Symbol
            </label>
            <input
              required
              name="currency"
              defaultValue={initialData?.currency || "BDT"}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Contact Email
            </label>
            <input
              name="storeEmail"
              defaultValue={initialData?.storeEmail}
              type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="support@store.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Customer Support Phone
            </label>
            <input
              name="storePhone"
              defaultValue={initialData?.storePhone}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="+880 1XXX XXXXXX"
            />
          </div>
        </div>
      </section>

      {/* 2. Logistics & Delivery */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Truck className="size-5 text-slate-400" />
          <h2 className="text-xl font-black text-slate-900">
            Logistics & Constraints
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Delivery Charge (Inside Dhaka)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ৳
              </span>
              <input
                name="deliveryChargeInside"
                defaultValue={initialData?.deliveryChargeInside ?? 60}
                type="number"
                min="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Delivery Charge (Outside Dhaka)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ৳
              </span>
              <input
                name="deliveryChargeOutside"
                defaultValue={initialData?.deliveryChargeOutside ?? 120}
                type="number"
                min="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-bold text-slate-700">
              Free Shipping Threshold
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ৳
              </span>
              <input
                name="freeShippingThreshold"
                defaultValue={initialData?.freeShippingThreshold ?? 0}
                type="number"
                min="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1.5">
              Value 0 disables the free shipping feature.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Socials */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Share2 className="size-5 text-slate-400" />
          <h2 className="text-xl font-black text-slate-900">
            Social Connections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Facebook URL
            </label>
            <input
              name="facebookURL"
              defaultValue={initialData?.facebookURL}
              type="url"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Instagram URL
            </label>
            <input
              name="instagramURL"
              defaultValue={initialData?.instagramURL}
              type="url"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </section>

      {/* 4. Danger Zone */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldAlert className="size-5 text-rose-500" />
          <h2 className="text-xl font-black text-rose-600">Danger Zone</h2>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="mt-1">
            <input
              type="checkbox"
              name="maintenanceMode"
              id="maintenanceMode"
              defaultChecked={initialData?.maintenanceMode}
              className="size-5 rounded border-gray-300 text-rose-600 focus:ring-rose-600"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="maintenanceMode"
              className="text-base font-black text-rose-900 leading-none"
            >
              Enable Maintenance Mode
            </label>
            <p className="text-sm text-rose-700/80 mt-1.5 font-medium leading-relaxed">
              Checking this instantly disables consumer access to the main
              storefront. Only administrators will be able to log in and test
              routing paths. This is a highly destructive state switch.
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">
        <button
          disabled={isLoading}
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-10 py-3.5 rounded-xl font-black tracking-tight shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          Save Global Settings
        </button>
      </div>
    </form>
  );
}
