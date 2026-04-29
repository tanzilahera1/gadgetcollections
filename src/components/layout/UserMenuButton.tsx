// src/components/layout/UserMenuButton.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  History,
  ShoppingBag,
  HelpCircle,
  Crown,
  ChevronRight,
  MapPin,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenuButton() {
  const { data: session, status } = useSession();
  console.log(`session: ${JSON.stringify(session)}`);

  if (status === "loading") {
    return <div className="size-9 rounded-full bg-slate-100 animate-pulse" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 border border-slate-200 bg-white"
          aria-label="Login"
        >
          <User className="size-5 text-slate-500" />
        </Button>
      </Link>
    );
  }

  const initials =
    session.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="group relative flex items-center gap-2  rounded-full hover:bg-slate-50 transition-all focus:outline-none"
          aria-label="Account menu"
        >
          <div className="relative">
            <Avatar className="   transition-transform group-hover:scale-105">
              <AvatarImage
                src={session.user?.image ?? ""}
                alt={session.user?.name ?? "User"}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 border border-white rounded-full" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-[1.5rem] p-2 shadow-2xl border-slate-200 mt-2 bg-white/95 backdrop-blur-xl"
      >
        {/* User Header */}
        <div className="flex items-center gap-3 p-4">
          <Avatar className="size-12 border border-slate-100 shadow-sm">
            <AvatarImage
              src={session.user?.image ?? ""}
              alt={session.user?.name ?? "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                {session.user?.name}
              </p>
              {session.user?.role === "admin" ? (
                <ShieldCheck className="size-3.5 text-primary" />
              ) : (
                <Crown className="size-3.5 text-amber-500 fill-amber-500" />
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 truncate opacity-80">
              {session.user?.email}
            </p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider">
              {session.user?.role === "admin" ? "Super Admin" : "Royal Member"}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 mx-2" />

        <div className="p-1 space-y-0.5">
          {session.user?.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-primary/5 text-slate-700 hover:text-primary transition-all group"
              > 
                <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                  <ShieldCheck className="size-4.5" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">
                  Admin Panel
                </span>
                <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <LayoutDashboard className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Dashboard</span>
              <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/orders"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <ShoppingBag className="size-4.5" />
              </div>
              <span className="text-xs font-bold">My Orders</span>
              <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <User className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Profile</span>
              <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/addresses"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <MapPin className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Addresses</span>
              <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/wishlist"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <Heart className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Wishlist</span>
              <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/payments"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <History className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Payment History</span>
              <ChevronRight className="size-3.5 ml-auto opacity-20 group-hover:opacity-100" />
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 mx-2" />

        <div className="p-1 space-y-0.5">
          <DropdownMenuItem asChild>
            <Link
              href="/products"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <ShoppingBag className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Browse Products</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/help"
              className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 text-slate-700 transition-all group"
            >
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                <HelpCircle className="size-4.5" />
              </div>
              <span className="text-xs font-bold">Help & Support</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-slate-100 mx-2" />

        <div className="p-1">
          <DropdownMenuItem
            className="rounded-xl flex items-center gap-3 p-3.5 cursor-pointer hover:bg-rose-50 text-rose-600 focus:text-rose-600 focus:bg-rose-50 transition-all group"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <div className="size-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-white group-hover:shadow-sm">
              <LogOut className="size-4.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">
              Sign Out
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
