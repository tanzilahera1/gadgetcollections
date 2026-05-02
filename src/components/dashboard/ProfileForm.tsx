// src/components/dashboard/ProfileForm.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

interface UserProfile {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
}

export function ProfileForm({ initialData }: { initialData: UserProfile }) {
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    image: initialData?.image || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          image: formData.image,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully");
        updateSession({ name: formData.fullName, image: formData.image });
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error(`Something went wrong from profile from ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Image Section */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24" />

          <div className="relative group">
            <div className="relative size-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-50">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt={formData.fullName}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center bg-primary/10 text-primary">
                  <User className="size-12" />
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute -bottom-2 -right-2 size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-primary transition-colors hover:scale-110 active:scale-95"
              onClick={() =>
                toast.info("Image upload functionality coming soon!")
              }
            >
              <Camera className="size-5" />
            </button>
          </div>

          <div className="flex-1 space-y-1 text-center md:text-left">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Profile Photo
            </h3>
            <p className="text-sm font-medium text-slate-400 max-w-xs">
              Upload a professional headshot. JPEG or PNG, max 2MB.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <User className="size-3" /> Full Name
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fullName: e.target.value }))
                }
                className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-base focus-visible:ring-primary/20 px-6"
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Mail className="size-3" /> Email Address
              </label>
              <div className="relative">
                <Input
                  value={formData.email}
                  disabled
                  className="h-14 rounded-2xl bg-slate-100 border-none font-bold text-base px-6 italic text-slate-400 cursor-not-allowed"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-emerald-500 opacity-50" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                <Phone className="size-3" /> Phone Number
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-base focus-visible:ring-primary/20 px-6"
                placeholder="017XXXXXXXX"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
