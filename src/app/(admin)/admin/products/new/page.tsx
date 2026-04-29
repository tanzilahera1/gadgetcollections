import ProductForm from "./ProductForm";
import Category from "@/models/Category";
import { dbConnect } from "@/lib/db";

export const metadata = {
  title: "Add New Product | Admin",
  description: "Create a new product listing in your store.",
};

async function getCategories() {
  await dbConnect();
  const categories = await Category.find().select("_id name").sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Product</h1>
        <p className="text-slate-500 font-medium tracking-tight">Add a new item to your catalog. Fill in all required details.</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
