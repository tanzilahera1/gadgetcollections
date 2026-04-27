// src/components/auth/LoginForm.tsx
"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/actions/auth";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল অ্যাড্রেস দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  // ✅ FIX: .default() বাদ দিয়ে সরাসরি boolean করা
  rememberMe: z.boolean(),
});

// ✅ Schema থেকে type নয়, manually define করা — mismatch এড়াতে
type LoginInput = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function LoginFormInner() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  // ✅ FIX: LoginInput explicitly দেওয়া এবং defaultValues এ সব field দেওয়া
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    // ✅ FIX: zodResolver এর generic explicitly set
    resolver: zodResolver(
      loginSchema,
    ) as import("react-hook-form").Resolver<LoginInput>,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // ✅ FIX: SubmitHandler type ব্যবহার
  const onSubmit: import("react-hook-form").SubmitHandler<LoginInput> = async (
    data,
  ) => {
    setIsLoading(true);
    try {
      const result = await login({ ...data, callbackUrl });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("লগিন সফল হয়েছে!");
      }
    } catch {
      // next-auth redirects on success
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Log In
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-primary transition-colors">
                  <Mail className="size-4" />
                </div>
                <Input
                  {...register("email")}
                  placeholder="Email"
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
                  <Lock className="size-4" />
                </div>
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-rose-500 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="size-4 rounded-md border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-primary hover:underline underline-offset-4 decoration-2"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-white gap-2"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Login
                  <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
              <span className="bg-white/40 px-2 text-slate-400 backdrop-blur-sm">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-14 rounded-2xl border-slate-200 hover:bg-slate-50 bg-white/60 font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs font-bold text-slate-400">
              New user?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline underline-offset-4 decoration-2"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Export এ Suspense wrap
export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto h-125 rounded-[2.5rem] bg-white/40 animate-pulse" />
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
