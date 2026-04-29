import BrandForm from "./BrandForm";

export const metadata = {
  title: "Add New Brand | Admin",
  description: "Create a new product manufacturer brand.",
};

export default function NewBrandPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Add Brand
        </h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Register a new brand or manufacturer to link with your products.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <BrandForm />
      </div>
    </div>
  );
}
