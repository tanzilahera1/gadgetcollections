import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Setting from "@/models/Setting";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export const metadata = {
  title: "Store Settings | Admin",
};

async function getStoreSettings() {
  await dbConnect();
  const settings = await Setting.findOne().lean();
  return JSON.parse(JSON.stringify(settings || {}));
}

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const initialSettings = await getStoreSettings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Store Settings
        </h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Configure global e-commerce variables and logistics.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <SettingsForm initialData={initialSettings} />
      </div>
    </div>
  );
}
