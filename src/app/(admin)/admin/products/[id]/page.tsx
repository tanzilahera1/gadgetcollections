import ProductForm from "../new/ProductForm";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { dbConnect } from "@/lib/db";
import { notFound } from "next/navigation";
import { Types } from "mongoose";

export const metadata = {
  title: "Edit Product | Admin",
  description: "Update an existing product listing.",
};

async function getProductData(id: string) {
  await dbConnect();
  
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find().select("_id name").sort({ name: 1 }).lean()
  ]);

  if (!product) return null;

  return {
    product: JSON.parse(JSON.stringify(product)),
    categories: JSON.parse(JSON.stringify(categories))
  };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const data = await getProductData(resolvedParams.id);
  
  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Edit Product</h1>
        <p className="text-slate-500 font-medium tracking-tight">Update information for {data.product.title}</p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <ProductForm categories={data.categories} initialData={data.product} />
      </div>
    </div>
  );
}
