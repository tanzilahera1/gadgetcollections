"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/actions/adminCategories";
import { toast } from "sonner";
import { Loader2, Info, Image as ImageIcon, Save, Target } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CategoryForm({ initialData }: { initialData?: any }) {
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
      image: formData.get("image") as string,
      seoTitle: formData.get("seoTitle") as string,
      seoDesc: formData.get("seoDesc") as string,
    };

    try {
      const res = isEditing 
        ? await updateCategory(initialData._id, data) 
        : await createCategory(data);
        
      if (res.success) {
        toast.success(isEditing ? "Category updated successfully!" : "Category created successfully!");
        router.push("/admin/categories");
      } else {
        toast.error(res.error || "Failed to process category");
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
            <h2 className="text-xl font-black text-slate-900">Basic Details</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Category Name *</label>
               <input required name="name" defaultValue={initialData?.name} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="E.g. Smartphones" />
            </div>
            
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Slug URL (Optional)</label>
               <input name="slug" defaultValue={initialData?.slug} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. smart-phones (auto-generated if empty)" />
            </div>

            <div className="space-y-2 sm:col-span-2">
               <label className="text-sm font-bold text-slate-700">Description</label>
               <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y" placeholder="Brief explanation of this category's products." />
            </div>
         </div>
      </section>

      {/* 2. Media */}
      <section className="space-y-6">
         <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ImageIcon className="size-5 text-slate-400" />
            <h2 className="text-xl font-black text-slate-900">Media</h2>
         </div>

         <div className="space-y-2">
             <label className="text-sm font-bold text-slate-700">Cover Image URL</label>
             <input name="image" defaultValue={initialData?.image} type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="https://example.com/cover.jpg" />
         </div>
      </section>

      {/* 3. SEO */}
      <section className="space-y-6">
         <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Target className="size-5 text-slate-400" />
            <h2 className="text-xl font-black text-slate-900">Search Engine Optimization</h2>
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">SEO Title</label>
               <input name="seoTitle" defaultValue={initialData?.seoTitle} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Title for search engines" />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">SEO Description</label>
               <textarea name="seoDesc" defaultValue={initialData?.seoDesc} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y" placeholder="Meta description for search engines." />
            </div>
         </div>
      </section>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-4">
         <button type="button" onClick={() => router.back()} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
         </button>
         <button disabled={isLoading} type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-10 py-3.5 rounded-xl font-black tracking-tight shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none">
            {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            {isEditing ? "Save Changes" : "Create Category"}
         </button>
      </div>
    </form>
  );
}
