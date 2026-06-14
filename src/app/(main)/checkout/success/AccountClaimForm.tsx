"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const ClaimSchema = z.object({
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
});

type ClaimValues = z.infer<typeof ClaimSchema>;

export function AccountClaimForm({ orderNumber }: { orderNumber: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClaimValues>({
    resolver: zodResolver(ClaimSchema),
  });

  const onSubmit = async (data: ClaimValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/claim-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, orderNumber }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "একাউন্ট তৈরি করতে সমস্যা হয়েছে");
        return;
      }

      toast.success("সফলভাবে একাউন্ট তৈরি হয়েছে! এখন লগিন করুন।");
      router.push("/login");
    } catch (error) {
      toast.error("সার্ভার এরর, একটু পর আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto text-left space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <UserPlus className="size-6" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight">একাউন্ট তৈরি করুন (ঐচ্ছিক)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ভবিষ্যতে এক ক্লিকে অর্ডার করতে এবং সব অর্ডারের স্ট্যাটাস দেখতে আপনার ইমেইল দিয়ে একটি পাসওয়ার্ড সেট করুন।
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
            ইমেইল
          </Label>
          <Input
            {...register("email")}
            type="email"
            placeholder="আপনার ইমেইল দিন"
            className="h-12 rounded-xl bg-background"
          />
          {errors.email && (
            <p className="text-xs text-destructive font-bold">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
            নতুন পাসওয়ার্ড
          </Label>
          <Input
            {...register("password")}
            type="password"
            placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
            className="h-12 rounded-xl bg-background"
          />
          {errors.password && (
            <p className="text-xs text-destructive font-bold">{errors.password.message}</p>
          )}
        </div>
        
        <Button
          disabled={isSubmitting}
          type="submit"
          className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin size-5" />
          ) : (
            <div className="flex items-center gap-2">
              <span>একাউন্ট তৈরি করে লিংক করুন</span>
              <ArrowRight className="size-4" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
