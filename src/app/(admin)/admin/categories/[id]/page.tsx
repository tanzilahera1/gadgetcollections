import CategoryForm from "../new/CategoryForm";
import Category from "@/models/Category";
import { dbConnect } from "@/lib/db";
import { notFound } from "next/navigation";
import { Types } from "mongoose";

export const metadata = {
  title: "Edit Category | Admin",
  description: "Update an existing categor listing.",
};

async function getCategoryData(id: string) {
  await dbConnect();
  
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  
  const category = await Category.findById(id).lean();

  if (!category) return null;

  return JSON.parse(JSON.stringify(category));
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const category = await getCategoryData(resolvedParams.id);
  
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Category</h1>
        <p className="text-slate-500 font-medium tracking-tight">Update information for {category.name}</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
}
