"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrand, updateBrand } from "@/actions/adminBrands";
import { toast } from "sonner";
import { Loader2, Info, Image as ImageIcon, Save } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function BrandForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      logo: formData.get("logo") as string,
    };

    try {
      const res = isEditing
        ? await updateBrand(initialData._id, data)
        : await createBrand(data);

      if (res.success) {
        toast.success(
          isEditing
            ? "Brand updated successfully!"
            : "Brand created successfully!",
        );
        router.push("/admin/brands");
      } else {
        toast.error(res.error || "Failed to process brand");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* 1. Basic Info */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Info className="size-5 text-slate-400" />
          <h2 className="text-xl font-black text-slate-900">Brand Identity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Brand Name *
            </label>
            <input
              required
              name="name"
              defaultValue={initialData?.name}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="E.g. Apple"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              Slug URL (Optional)
            </label>
            <input
              name="slug"
              defaultValue={initialData?.slug}
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. apple (auto-generated if empty)"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-bold text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
              placeholder="Brief history or description of the brand."
            />
          </div>
        </div>
      </section>

      {/* 2. Media */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ImageIcon className="size-5 text-slate-400" />
          <h2 className="text-xl font-black text-slate-900">Media Assets</h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            Brand Logo URL
          </label>
          <input
            name="logo"
            defaultValue={initialData?.logo}
            type="url"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="https://example.com/logo.png"
          />
        </div>
      </section>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={isLoading}
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-10 py-3.5 rounded-xl font-black tracking-tight shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {isEditing ? "Save Changes" : "Create Brand"}
        </button>
      </div>
    </form>
  );
}
