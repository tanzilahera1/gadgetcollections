import BrandForm from "../new/BrandForm";
import Brand from "@/models/Brand";
import { dbConnect } from "@/lib/db";
import { notFound } from "next/navigation";
import { Types } from "mongoose";

export const metadata = {
  title: "Edit Brand | Admin",
  description: "Update an existing brand listing.",
};

async function getBrandData(id: string) {
  await dbConnect();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const brand = await Brand.findById(id).lean();

  if (!brand) return null;

  return JSON.parse(JSON.stringify(brand));
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const brand = await getBrandData(resolvedParams.id);

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Edit Brand
        </h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Update information for {brand.name}
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <BrandForm initialData={brand} />
      </div>
    </div>
  );
}
