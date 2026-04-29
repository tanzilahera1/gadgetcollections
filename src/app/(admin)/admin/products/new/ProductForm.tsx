"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/adminProducts";
import { toast } from "sonner";
import { Loader2, Plus, Info, Image as ImageIcon, Save, X } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProductForm({ categories, initialData }: { categories: Category[], initialData?: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [images, setImages] = useState<string[]>(initialData ? initialData.images.map((img: any) => img.url) : [""]);
  
  const isEditing = !!initialData;

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) => {
    if (images.length > 1) {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      sku: formData.get("sku") as string,
      category: formData.get("category") as string,
      thumbnail: formData.get("thumbnail") as string,
      shortDesc: formData.get("shortDesc") as string,
      description: formData.get("description") as string,
      regularPrice: Number(formData.get("regularPrice")),
      salePrice: Number(formData.get("salePrice")) || 0,
      stockQuantity: Number(formData.get("stockQuantity")),
      status: formData.get("status") as string,
      isDraft: formData.get("status") === "draft",
      images: images.filter(img => img.trim() !== ""),
      featured: formData.get("featured") === "on",
      bestseller: formData.get("bestseller") === "on",
    };

    try {
      const res = isEditing 
        ? await updateProduct(initialData._id, data) 
        : await createProduct(data);
        
      if (res.success) {
        toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
        router.push("/admin/products");
      } else {
        toast.error(res.error || "Failed to process product");
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
               <label className="text-sm font-bold text-slate-700">Product Title *</label>
               <input required name="title" defaultValue={initialData?.title} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="E.g. Apple iPhone 15 Pro" />
            </div>
            
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">SKU (Stock Keeping Unit) *</label>
               <input required name="sku" defaultValue={initialData?.sku} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="E.g. IP-15-PRO-256" />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Category *</label>
               <select required name="category" defaultValue={initialData?.category} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Stock Quantity *</label>
               <input required name="stockQuantity" defaultValue={initialData?.stockQuantity} type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0" />
            </div>
         </div>
      </section>

      {/* 2. Pricing & Status */}
      <section className="space-y-6">
         <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="font-black text-xl text-slate-400">৳</span>
            <h2 className="text-xl font-black text-slate-900">Pricing & Status</h2>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Regular Price (৳) *</label>
               <input required name="regularPrice" defaultValue={initialData?.regularPrice} type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="E.g. 120000" />
            </div>
            
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Sale Price (৳)</label>
               <input name="salePrice" defaultValue={initialData?.salePrice || ""} type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Optional. If given, items show discount." />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Status *</label>
               <select required name="status" defaultValue={initialData ? initialData.status : "published"} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="published">Published (Active)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
               </select>
            </div>
         </div>
         
         <div className="flex flex-wrap items-center gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" name="featured" defaultChecked={initialData?.featured} className="size-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer transition-all" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Featured Product</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" name="bestseller" defaultChecked={initialData?.bestseller} className="size-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer transition-all" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Bestseller</span>
            </label>
         </div>
      </section>

      {/* 3. Media */}
      <section className="space-y-6">
         <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ImageIcon className="size-5 text-slate-400" />
            <h2 className="text-xl font-black text-slate-900">Media</h2>
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Thumbnail URL *</label>
               <input required name="thumbnail" defaultValue={initialData?.thumbnail} type="url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="https://example.com/image.jpg" />
               <p className="text-xs text-slate-500 font-medium ml-1">This is the main image shown on the product card.</p>
            </div>

            <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
               <div>
                 <label className="text-sm font-bold text-slate-700">Gallery Images (URLs)</label>
                 <p className="text-xs text-slate-500 font-medium mb-4">Add additional images for the product page gallery.</p>
               </div>
               
               {images.map((img, index) => (
                  <div key={index} className="flex items-center gap-2">
                     <input 
                       type="url" 
                       value={img} 
                       onChange={(e) => handleImageChange(index, e.target.value)} 
                       className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                       placeholder="https://example.com/gallery-image.jpg" 
                     />
                     <button type="button" onClick={() => removeImageField(index)} className="size-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all shrink-0">
                        <X className="size-4" />
                     </button>
                  </div>
               ))}
               
               <button type="button" onClick={addImageField} className="text-xs font-bold text-primary flex items-center gap-1.5 mt-2 hover:underline underline-offset-4 decoration-2">
                  <Plus className="size-3.5" />
                  Add another image
               </button>
            </div>
         </div>
      </section>

      {/* 4. Description */}
      <section className="space-y-6">
         <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Description</h2>
         </div>

         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Short Description *</label>
               <input required name="shortDesc" defaultValue={initialData?.shortDesc} maxLength={160} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Brief summary (max 160 characters)" />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700">Full Description *</label>
               <textarea required name="description" defaultValue={initialData?.description} rows={8} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y" placeholder="Extensive product details, features, and specifications..." />
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
            {isEditing ? "Save Changes" : "Create Product"}
         </button>
      </div>
    </form>
  );
}
