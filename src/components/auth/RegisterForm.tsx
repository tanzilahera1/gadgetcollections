"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/actions/auth";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const registerSchema = z.object({
  fullName: z.string().min(3, "নাম কমপক্ষে ৩ অক্ষর হওয়া উচিত"),
  email: z.string().email("সঠিক ইমেইল অ্যাড্রেস দিন"),
  password: z
    .string()
    .min(8, "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে")
    .regex(/[A-Z]/, "পাসওয়ার্ডে কমপক্ষে একটি বড় হাতের অক্ষর (A-Z) থাকতে হবে")
    .regex(/[0-9]/, "পাসওয়ার্ডে কমপক্ষে একটি সংখ্যা (0-9) থাকতে হবে"),
});

type RegisterInput = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const result = await signUp(data);
      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        toast.success("রেজিস্ট্রেশন সফল হয়েছে! লগইন হচ্ছে...");

        // অটোমেটিক লগইন
        const loginResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
          callbackUrl,
        });

        if (loginResult?.error) {
          toast.error("স্বয়ংক্রিয় লগইন ব্যর্থ হয়েছে। দয়া করে লগইন করুন।");
          router.push("/login");
        } else {
          router.replace(loginResult?.url || callbackUrl);
          router.refresh();
        }
      }
    } catch (error) {
      toast.error(`কিছু ভুল হয়েছে। আবার চেষ্টা করুন। ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden group">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 size-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-primary/10 transition-colors duration-700" />

        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Sign Up
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Create your account to start shopping.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-primary transition-colors">
                  <User className="size-4.5" />
                </div>
                <Input
                  {...register("fullName")}
                  placeholder="Your Full Name"
                  className={cn(
                    "h-14 pl-12 pr-4 bg-white/60 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 ring-primary/5 transition-all text-sm font-bold",
                    errors.fullName &&
                      "border-rose-500 focus:ring-rose-500/5 bg-rose-50/30",
                  )}
                />
              </div>
              {errors.fullName && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-primary transition-colors">
                  <Mail className="size-4.5" />
                </div>
                <Input
                  {...register("email")}
                  placeholder="Your Email Address"
                  className={cn(
                    "h-14 pl-12 pr-4 bg-white/60 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 ring-primary/5 transition-all text-sm font-bold",
                    errors.email &&
                      "border-rose-500 focus:ring-rose-500/5 bg-rose-50/30",
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-primary transition-colors">
                  <Lock className="size-4.5" />
                </div>
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a password"
                  className={cn(
                    "h-14 pl-12 pr-12 bg-white/60 border-slate-200 rounded-2xl focus:bg-white focus:ring-4 ring-primary/5 transition-all text-sm font-bold",
                    errors.password &&
                      "border-rose-500 focus:ring-rose-500/5 bg-rose-50/30",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4.5" />
                  ) : (
                    <Eye className="size-4.5" />
                  )}
                </button>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-slate-200 mt-2 opacity-50">
                <ShieldCheck className="size-3 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-slate-500 leading-tight">
                  Password must be at least 8 characters, with uppercase &
                  number
                </p>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-white gap-2"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-400">
              Already have an account?{" "}
              <Link
                href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                className="text-primary hover:underline underline-offset-4 decoration-2"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
