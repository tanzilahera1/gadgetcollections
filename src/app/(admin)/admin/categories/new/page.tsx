import CategoryForm from "./CategoryForm";

export const metadata = {
  title: "Add New Category | Admin",
  description: "Create a new product category.",
};

export default function NewCategoryPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Create Category
        </h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Add a new taxonomy category to organize your products.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <CategoryForm />
      </div>
    </div>
  );
}
