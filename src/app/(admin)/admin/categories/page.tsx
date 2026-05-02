import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Category from "@/models/Category";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Layers, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { ICategory } from "@/types/category";

export const metadata = {
  title: "Manage Categories | Admin",
};

async function getCategories() {
  await dbConnect();

  const categories = await Category.find().sort({ createdAt: -1 }).lean();

  return JSON.parse(JSON.stringify(categories));
}

export default async function AdminCategoriesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const categories = await getCategories();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="text-slate-500 font-medium">
            Manage product taxonomy and collections
          </p>
        </div>

        <Link href="/admin/categories/new">
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold tracking-tight shadow-md hover:shadow-lg transition-all active:scale-95">
            <Plus className="size-5" />
            Add Category
          </button>
        </Link>
      </div>

      {/* Stats/Filters Box */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <div className="size-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black">
              {categories.length}
            </div>
            <span className="text-sm font-bold text-slate-600">
              Total Categories
            </span>
          </div>
        </div>

        {/* Search Input (client-side logic placeholder) */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black tracking-widest uppercase text-slate-400">
                <th className="p-6 font-bold w-16">Image</th>
                <th className="p-6 font-bold">Category Info</th>
                <th className="p-6 font-bold">SEO Snapshot</th>
                <th className="p-6 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length > 0 ? (
                categories.map((cat: ICategory) => (
                  <tr
                    key={String(cat._id)}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="relative size-14 rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden p-1 flex items-center justify-center">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="56px"
                            className="object-contain"
                          />
                        ) : (
                          <Layers className="size-6 text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="max-w-xs">
                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {cat.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5 font-mono">
                          /{cat.slug}
                        </p>
                        {cat.description && (
                          <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="max-w-[200px]">
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">
                          {cat.seoTitle || "No SEO Title"}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                          {cat.seoDesc || "No SEO Description provided."}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/categories/${String(cat._id)}`}>
                          <button
                            className="size-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/30 hover:shadow-sm transition-all"
                            title="Edit category"
                          >
                            <Edit className="size-4" />
                          </button>
                        </Link>
                        {/* Safe delete implemented later via dialog */}
                        <button
                          className="size-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/30 hover:shadow-sm transition-all"
                          title="Delete category"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    <Layers className="size-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-bold">No categories found</p>
                    <p className="text-sm mt-1">
                      Organize your store by creating your first category.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
